'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LOCAL_ME_KEY, LOCAL_TASKS_KEY, isUntouchedSample, type Store, type StoreOptions, type SyncState } from './store';
import { LOCAL_DOCS_KEY, isUntouchedSampleDoc, type DocStore } from './docStore';
import type { MemoStore } from './memoStore';
import {
  PENDING_KEY, docFromRow, docToRow, isMissingTable, memoFromRow, memoToRow, sb, taskFromRow, taskToRow,
  type DocRow, type MemoRow, type TaskRow,
} from './supabase';
import type { Doc, Memo, Task } from './types';

/*
 * Supabase 저장소 - 작업 · 문서를 팀이 함께 쓴다. 개인 메모는 쓴 사람만 읽고 쓴다(표의 RLS).
 *
 * 화면은 먼저 바꾸고(누르는 즉시 반영) 서버에는 뒤에서 보낸다.
 *   · 글자를 칠 때마다 보내지 않는다 - 한 줄에 대해 0.45초 동안 모아 한 번에 보낸다.
 *   · 한 줄에 대한 요청은 차례대로 보낸다(앞 요청이 끝나야 다음). 만들기 전에 고치기가 먼저 닿지 않게.
 *   · 다른 사람이 고친 것은 실시간(Realtime)으로 받는다. 내가 아직 보내는 중인 칸은 덮지 않는다.
 *   · 연결 문제로 못 보낸 것은 화면에 그대로 두고 다시 보낸다(연결이 돌아올 때 · 탭으로 돌아올 때 · 잠시 뒤).
 *   · 서버가 거절한 것(권한 · 규칙)은 알리고 서버의 내용으로 화면을 다시 맞춘다.
 */

type Entity = { id: string };
type Change<R> = { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: R; old: Partial<R> };
type DbError = { message?: string; code?: string };
type Result = { error: DbError | null; status?: number };
/** ok 됐다 · retry 연결 문제라 다시 보낸다 · gone 고칠 줄이 서버에 없다 · fail 서버가 거절했다 */
type Outcome = 'ok' | 'retry' | 'gone' | 'fail';

interface SyncOptions<T, R> {
  table: string;
  fromRow(r: R): T;
  toRow(p: Partial<T>): Partial<R>;
  /** gone = 다른 곳에서 지운 줄에 보내지 못한 고침이 있었다, createFail = 서버가 새 줄을 받지 않았다 */
  texts: { gone: string; createFail(title: string): string };
  onError?(text: string): void;
}

interface SyncView<T> {
  items: T[];
  sync: SyncState;
  ready: boolean;
  /** 처음 목록을 읽지 못했다(빈 목록과 구별한다). 한 번 읽은 뒤의 실패로는 생기지 않는다 */
  loadError: string | null;
  /** 다른 곳에서 지워 화면에서 뺀 줄 → 보내지 못한 고침이 있었는가. 같은 줄이 되살아나면 빠진다 */
  deleted: ReadonlyMap<string, boolean>;
}

const MISSING = 'Supabase 에 작업 관리 표가 없습니다. supabase/taskmanager.sql 을 실행해 주세요.';
const LOAD_FAIL = '목록을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.';
/** 연결 문제 알림 - 다 보내고 나면 화면이 이 알림을 거둔다 */
export const RETRY = '서버에 닿지 않아 아직 저장하지 못했습니다. 연결되면 저절로 다시 보냅니다.';
const FAIL_RESYNCED = '저장하지 못했습니다. 서버가 받아 주지 않아 화면을 저장된 내용으로 되돌렸습니다.';
const FAIL_UNSENT = '저장하지 못했습니다. 서버가 받아 주지 않았고 화면도 다시 맞추지 못했습니다. 새로고침해 주세요.';

/** 목록을 한 번에 읽는 줄 수 - Supabase Data API 의 기본 상한(Max rows)이 1000 이다 */
const PAGE = 1000;

/** 고친 줄이 0개 - 그사이 누가 지웠다 */
const GONE = 'TM_GONE';
/** 새 줄이 아직 서버에 없다 - 고치기를 보내지 않고 만들기 뒤로 미룬다 */
const WAIT: Result = { error: { code: '', message: 'waiting for insert' }, status: 0 };

function outcomeOf(res: Result | null): Outcome {
  if (!res) return 'retry';
  const { error, status = 0 } = res;
  if (!error) return 'ok';
  if (error.code === GONE) return 'gone';
  // 코드 없음 · 상태 0 은 요청이 서버에 닿지 않은 것. 401 은 잠에서 깬 직후 만료된 로그인(곧 새로 받는다)
  if (!error.code || error.code.startsWith('PGRST00') || [0, 401, 408, 429, 502, 503, 504].includes(status)) return 'retry';
  return 'fail';
}

const NONE: ReadonlyMap<string, boolean> = new Map();

class RowSync<T extends Entity & { title: string }, R extends Entity> {
  items: T[] = [];
  /** 서버에 아직 확정되지 않은 칸 - 실시간으로 온 값이 이 칸을 덮지 않는다 */
  private dirty = new Map<string, Set<string>>();
  /** 묶어 보내려고 기다리는 칸 */
  private queued = new Map<string, Partial<T>>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private chains = new Map<string, Promise<void>>();
  /** 만들었지만 아직 서버에 들어가지 않은 줄 - 목록을 다시 읽어도 지우지 않는다 */
  private creating = new Set<string>();
  /** 지웠지만 아직 서버에서 지워지지 않은 줄 - 목록을 다시 읽어도 되살리지 않는다 */
  private removing = new Set<string>();
  private inflight = 0;
  /** 연결 문제로 못 보내 다시 보낼 고치기 - 칸 값은 queued 에 그대로 있다 */
  private failed = new Set<string>();
  /** 연결 문제로 못 넣은 새 줄 · 못 지운 줄 - 다시 보낼 때 부른다 */
  private redo = new Map<string, () => void>();
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private tries = 0;
  /** 연결 문제를 이미 알렸는가 - 다시 보낼 때마다 알리지 않는다 */
  private warned = false;
  /** 서버가 거절한 뒤 화면을 아직 서버와 다시 맞추지 못했다 */
  private stale = false;
  private loaded = false;
  /** 화면에 붙어 있는가 - 떨어진 뒤에는 다시 보내기를 잡지 않는다 */
  private live = false;
  /** 줄이 바뀐 차례 - 다시 읽는 사이에 실시간 · 만들기 · 지우기로 바뀐 줄을 옛 목록으로 덮지 않는다 */
  private tick = 0;
  private touched = new Map<string, number>();
  private deleted = new Map<string, boolean>();
  /** 칸마다 그 값을 마지막으로 실어 보낸 요청의 차례 - 앞 요청이 늦게 끝나도 뒤 요청이 실어 간 값을 옛 값으로 덮지 않는다 */
  private sentSeq = new Map<string, Record<string, number>>();
  private seq = 0;

  constructor(
    public opt: SyncOptions<T, R>,
    private emit: (s: Partial<SyncView<T>>) => void,
  ) {}

  private set(items: T[]) {
    this.items = items;
    this.emit({ items });
  }

  private touch(id: string) {
    this.tick += 1;
    this.touched.set(id, this.tick);
  }

  /** 지워졌다고 알린 줄이 되살아났다(되돌리기 등) */
  private revive(id: string) {
    if (this.deleted.delete(id)) this.emit({ deleted: new Map(this.deleted) });
  }

  /** 저장 상태 - 못 보낸 것이 남아 있으면 error, 보내는 중이면 saving */
  private status() {
    const sync: SyncState = this.failed.size || this.redo.size || this.stale ? 'error' : this.busy() ? 'saving' : 'idle';
    this.emit({ sync });
  }

  private withLocal(server: T, local: T | undefined): T {
    const d = this.dirty.get(server.id);
    if (!d || !local) return server;
    const merged = { ...server } as Record<string, unknown>;
    d.forEach((k) => { merged[k] = (local as Record<string, unknown>)[k]; });
    return merged as T;
  }

  private merge(server: T) {
    this.touch(server.id);
    this.revive(server.id);
    const i = this.items.findIndex((x) => x.id === server.id);
    if (i < 0) {
      this.set([...this.items, server]);
      return;
    }
    const next = this.items.slice();
    next[i] = this.withLocal(server, this.items[i]);
    this.set(next);
  }

  /** 서버 목록을 다시 읽는다. quiet 면 실패해도 알리지 않는다(뒤에서 저절로 읽을 때). 읽었으면 참 */
  async reload(quiet = false): Promise<boolean> {
    const from = this.tick;
    let rows: R[] | null = null;
    let error: DbError | null = null;
    try {
      // 한 번에 PAGE 줄까지만 온다 - 덜 읽은 줄을 지워진 것으로 보지 않게 id 순으로 끝까지 나눠 읽는다
      const all: R[] = [];
      for (;;) {
        const after = all.length ? all[all.length - 1].id : null;
        const q = sb().from(this.opt.table).select('*');
        const res = await (after ? q.gt('id', after) : q).order('id').limit(PAGE);
        error = res.error;
        if (error || !res.data) break;
        all.push(...(res.data as R[]));
        if (res.data.length < PAGE) {
          rows = all;
          break;
        }
      }
    } catch (e) {
      error = { message: e instanceof Error ? e.message : String(e) };
    }
    if (error || !rows) {
      const text = isMissingTable(error) ? MISSING : LOAD_FAIL;
      if (!quiet) this.opt.onError?.(text);
      // 한 번 읽은 목록은 잠깐의 끊김으로 지우지 않는다 - 처음 읽기에 실패했을 때만 '불러오지 못함'
      this.emit(this.loaded ? { ready: true } : { ready: true, loadError: text });
      if (this.stale || !this.loaded) this.later();
      return false;
    }
    const byId = new Map(this.items.map((x) => [x.id, x]));
    const since = (id: string) => (this.touched.get(id) ?? 0) > from;
    const server: T[] = [];
    let revived = false;
    rows.forEach((r) => {
      const x = this.opt.fromRow(r);
      const local = byId.get(x.id);
      // 지우는 중이거나 읽는 사이 지워진 줄은 되살리지 않는다
      if (this.removing.has(x.id) || (!local && since(x.id))) return;
      if (this.deleted.delete(x.id)) revived = true;
      // 읽는 사이 실시간으로 더 새 값이 왔으면 그것을 둔다
      server.push(local && since(x.id) ? local : this.withLocal(x, local));
    });
    const ids = new Set(server.map((x) => x.id));
    const keep: T[] = [];
    const lost: string[] = [];
    this.items.forEach((x) => {
      if (ids.has(x.id)) return;
      // 아직 서버에 들어가는 중이거나 읽는 사이 생긴 줄은 남긴다. 나머지는 다른 곳에서 지운 것
      if (this.creating.has(x.id) || since(x.id)) keep.push(x);
      else lost.push(x.id);
    });
    this.set([...keep, ...server]);
    if (revived) this.emit({ deleted: new Map(this.deleted) });
    if (lost.length) this.gone(lost);
    this.loaded = true;
    this.stale = false;
    this.tries = 0;
    this.emit({ ready: true, loadError: null });
    this.status();
    return true;
  }

  /** 다른 곳에서 지운 줄을 화면에서 빼고, 그 줄에 걸린 저장은 버린다(지워진 줄에 다시 보내지 않는다) */
  private gone(ids: string[]) {
    const drop = new Set(ids);
    let unsaved = false;
    ids.forEach((id) => {
      const had = this.dirty.has(id) || this.queued.has(id);
      if (had) unsaved = true;
      const t = this.timers.get(id);
      if (t) clearTimeout(t);
      this.timers.delete(id);
      this.queued.delete(id);
      this.dirty.delete(id);
      this.sentSeq.delete(id);
      this.failed.delete(id);
      this.redo.delete(id);
      this.creating.delete(id);
      this.deleted.set(id, had);
    });
    this.set(this.items.filter((x) => !drop.has(x.id)));
    this.emit({ deleted: new Map(this.deleted) });
    if (unsaved) this.opt.onError?.(this.opt.texts.gone);
    this.status();
  }

  private onChange(c: Change<R>) {
    if (c.eventType === 'DELETE') {
      const id = c.old?.id;
      if (!id) return;
      this.touch(id);
      if (this.items.some((x) => x.id === id)) this.gone([id]);
      return;
    }
    const item = this.opt.fromRow(c.new);
    if (!this.removing.has(item.id)) this.merge(item);
  }

  /** 한 줄에 대한 요청을 앞 요청 뒤에 잇는다. failText 는 서버가 거절했을 때의 알림(없으면 기본 문구) */
  private run(id: string, job: () => PromiseLike<Result>, after?: (o: Outcome) => void, failText?: string): Promise<void> {
    this.inflight += 1;
    this.status();
    const prev = this.chains.get(id) ?? Promise.resolve();
    const p = prev.then(async () => {
      let res: Result | null = null;
      try {
        res = await job();
      } catch {
        res = null;
      }
      const o = outcomeOf(res);
      after?.(o);
      this.inflight -= 1;
      if (o === 'ok') {
        this.tries = 0;
      } else if (o === 'retry') {
        if (!this.warned) this.opt.onError?.(RETRY);
        this.warned = true;
        this.later();
      } else if (o === 'fail') {
        this.stale = true;
        void this.reload(true).then((ok) => this.opt.onError?.(failText ?? (ok ? FAIL_RESYNCED : FAIL_UNSENT)));
      }
      if (!this.failed.size && !this.redo.size) this.warned = false;
      this.status();
    });
    this.chains.set(id, p);
    void p.then(() => {
      if (this.chains.get(id) === p) this.chains.delete(id);
    });
    return p;
  }

  /** 잠시 뒤 다시 보낸다 - 2초에서 시작해 30초까지 늘린다 */
  private later() {
    if (!this.live || this.retryTimer) return;
    const wait = Math.min(30000, 2000 * 2 ** this.tries);
    this.tries = Math.min(this.tries + 1, 10);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.retryNow();
    }, wait);
  }

  /** 못 보낸 것을 지금 다시 보낸다. reload 면 서버 목록도 다시 읽는다 */
  private retryNow(reload = this.stale || !this.loaded) {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    const again = [...this.redo.values()];
    this.redo.clear();
    again.forEach((f) => f());
    [...this.failed].forEach((id) => this.flush(id));
    if (reload) void this.reload(true);
  }

  /** 보낸 칸을 확정한다. seq 를 주면 뒤 요청이 같은 칸을 실어 간 경우는 그 요청이 끝날 때까지 둔다 */
  private settle(id: string, sent: Partial<T>, seq?: number) {
    const d = this.dirty.get(id);
    if (!d) return;
    const again = this.queued.get(id);
    const last = this.sentSeq.get(id);
    Object.keys(sent).forEach((k) => {
      if ((!again || !(k in again)) && (seq === undefined || last?.[k] === seq)) d.delete(k);
    });
    if (d.size === 0) this.dirty.delete(id);
  }

  /** 연결 문제로 못 보낸 칸을 다시 기다리게 둔다. 그 뒤에 고친 값이나 뒤 요청이 실어 간 값이 있으면 그것이 이긴다 */
  private requeue(id: string, sent: Partial<T>, seq: number) {
    if (!this.items.some((x) => x.id === id)) {
      this.settle(id, sent);
      return;
    }
    const queued = this.queued.get(id) ?? {};
    const last = this.sentSeq.get(id);
    const back = Object.fromEntries(
      Object.entries(sent).filter(([k]) => last?.[k] === seq && !(k in queued)),
    ) as Partial<T>;
    if (Object.keys(back).length === 0) return;
    this.queued.set(id, { ...back, ...queued });
    this.failed.add(id);
  }

  private flush(id: string) {
    const t = this.timers.get(id);
    if (t) {
      clearTimeout(t);
      this.timers.delete(id);
    }
    const sent = this.queued.get(id);
    if (!sent) {
      this.failed.delete(id);
      return;
    }
    this.queued.delete(id);
    const row = this.opt.toRow(sent);
    if (Object.keys(row).length === 0) {
      this.failed.delete(id);
      this.settle(id, sent);
      this.status();
      return;
    }
    const table = this.opt.table;
    const seq = ++this.seq;
    const last = this.sentSeq.get(id) ?? {};
    Object.keys(sent).forEach((k) => { last[k] = seq; });
    this.sentSeq.set(id, last);
    void this.run(id, async () => {
      // 새 줄이 아직 서버에 없다(만들기를 다시 보내는 중) - 만들기 뒤에 같이 보낸다
      if (this.creating.has(id)) return WAIT;
      // 고친 줄이 0개면 그사이 누가 지운 것이다 - 성공으로 넘기지 않는다
      const res = await sb().from(table).update(row as Record<string, unknown>).eq('id', id).select('id');
      if (!res.error && !res.data?.length) return { error: { code: GONE, message: 'row not found' }, status: res.status };
      return res;
    }, (o) => {
      if (o === 'retry') {
        this.requeue(id, sent, seq);
        return;
      }
      // 앞 요청에서 못 보내 다시 기다리는 칸이 남아 있으면 다시 보낼 목록에서 빼지 않는다
      if (!this.queued.has(id)) this.failed.delete(id);
      if (o === 'gone' && this.items.some((x) => x.id === id)) this.gone([id]);
      else this.settle(id, sent, seq);
    });
  }

  /** 기다리는 것을 모두 보내고, 보낸 것이 끝날 때까지 기다린다(로그아웃 전에) */
  async flushAll() {
    this.retryNow(false);
    [...this.queued.keys()].forEach((id) => this.flush(id));
    await Promise.all([...this.chains.values()]);
  }

  busy() {
    return this.inflight > 0 || this.queued.size > 0 || this.redo.size > 0;
  }

  /** 화면을 바로 바꾸고 서버에는 모아서(또는 바로) 보낸다 */
  patch(id: string, p: Partial<T>, immediate = false) {
    this.set(this.items.map((x) => (x.id === id ? { ...x, ...p } : x)));
    const d = this.dirty.get(id) ?? new Set<string>();
    Object.keys(p).forEach((k) => d.add(k));
    this.dirty.set(id, d);
    this.queued.set(id, { ...(this.queued.get(id) ?? {}), ...p });
    const t = this.timers.get(id);
    if (t) clearTimeout(t);
    if (immediate) {
      this.flush(id);
    } else {
      this.timers.set(id, setTimeout(() => this.flush(id), 450));
      this.status();
    }
  }

  /** 새 줄. upsert 는 되돌리기(지운 것 되살리기)에 쓴다 */
  create(item: T, row: Partial<R> & Entity, upsert = false) {
    this.creating.add(item.id);
    this.removing.delete(item.id);
    this.redo.delete(item.id);
    this.touch(item.id);
    this.revive(item.id);
    this.set([item, ...this.items.filter((x) => x.id !== item.id)]);
    this.insert(item, row, upsert, false);
  }

  /** again = 다시 보내기. 앞서 보낸 것이 실은 들어갔는데 답만 못 받았으면 이미 있는 줄을 읽어 온다 */
  private insert(item: T, row: Partial<R> & Entity, upsert: boolean, again: boolean) {
    const table = this.opt.table;
    void this.run(item.id, async () => {
      const q = sb().from(table);
      let res = await (upsert ? q.upsert(row) : q.insert(row)).select('*').single();
      if (again && res.error?.code === '23505') res = await sb().from(table).select('*').eq('id', item.id).single();
      // 그사이 지웠으면 화면에 되살리지 않는다
      if (!res.error && !this.removing.has(item.id)) this.merge(this.opt.fromRow(res.data as R));
      return res;
    }, (o) => {
      // 연결 문제면 화면에 둔 채 다시 넣는다. 그 줄의 고치기는 넣은 뒤로 미뤄진다
      if (o === 'retry' && !this.removing.has(item.id)) {
        this.redo.set(item.id, () => this.insert(item, row, upsert, true));
        return;
      }
      this.creating.delete(item.id);
      if (o === 'fail') this.set(this.items.filter((x) => x.id !== item.id));
    }, this.opt.texts.createFail(item.title));
  }

  /** ids 를 화면에서 지우고 서버에서는 rootId 한 줄만 지운다(문서의 아래 문서는 DB 가 함께 지운다) */
  remove(ids: string[], rootId: string) {
    ids.forEach((id) => {
      const t = this.timers.get(id);
      if (t) clearTimeout(t);
      this.timers.delete(id);
      this.queued.delete(id);
      this.dirty.delete(id);
      this.sentSeq.delete(id);
      this.failed.delete(id);
      this.redo.delete(id);
      this.creating.delete(id);
      this.removing.add(id);
      this.touch(id);
    });
    this.set(this.items.filter((x) => !ids.includes(x.id)));
    this.drop(ids, rootId);
  }

  private drop(ids: string[], rootId: string) {
    void this.run(rootId, () => sb().from(this.opt.table).delete().eq('id', rootId), (o) => {
      // 연결 문제면 화면에서 뺀 채로 두고 다시 지운다. 그사이 되돌리기로 되살렸으면 다시 지우지 않는다
      if (o === 'retry') {
        if (this.removing.has(rootId)) this.redo.set(rootId, () => this.drop(ids, rootId));
      } else ids.forEach((id) => this.removing.delete(id));
    });
  }

  /** 실시간 구독을 열고 처음 목록을 읽는다. 돌려주는 함수가 닫는다 */
  start() {
    this.live = true;
    const client = sb();
    // 이름이 같으면 realtime-js 가 닫히는 중인 옛 채널을 돌려준다 - 붙일 때마다 새 이름을 쓴다
    const channel = client
      .channel(`tm-${this.opt.table}-${Math.random().toString(36).slice(2, 10)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: this.opt.table }, (payload) => {
        this.onChange(payload as unknown as Change<R>);
      })
      // 다시 연결될 때마다 못 보낸 것을 보내고, 한 번 읽어 그동안 놓친 것을 메운다
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') this.retryNow(true);
      });
    void this.reload();

    // 탭을 떠날 때는 기다리는 저장을 보내고, 돌아오면 못 보낸 것을 보내고 다시 읽는다(노트북을 덮었다 열면 실시간이 끊겨 있을 수 있다)
    const onHide = () => {
      if (document.visibilityState === 'hidden') [...this.queued.keys()].forEach((id) => this.flush(id));
      else this.retryNow(this.stale || !this.loaded || !this.busy());
    };
    const onOnline = () => this.retryNow();
    const onLeave = (e: BeforeUnloadEvent) => {
      [...this.queued.keys()].forEach((id) => this.flush(id));
      if (this.busy()) e.preventDefault();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('online', onOnline);
    window.addEventListener('beforeunload', onLeave);
    return () => {
      this.live = false;
      if (this.retryTimer) clearTimeout(this.retryTimer);
      this.retryTimer = null;
      [...this.queued.keys()].forEach((id) => this.flush(id));
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('beforeunload', onLeave);
      void client.removeChannel(channel);
    };
  }
}

function useRowSync<T extends Entity & { title: string }, R extends Entity>(opt: SyncOptions<T, R>) {
  const [state, setState] = useState<SyncView<T>>({
    items: [], sync: 'idle', ready: false, loadError: null, deleted: NONE,
  });
  const ref = useRef<RowSync<T, R> | null>(null);
  if (!ref.current) ref.current = new RowSync<T, R>(opt, (s) => setState((prev) => ({ ...prev, ...s })));
  const eng = ref.current;
  // 알림 함수가 바뀌어도 엔진은 그대로 두고 설정만 갈아 끼운다
  eng.opt = opt;
  useEffect(() => eng.start(), [eng]);
  return { ...state, eng };
}

const noop = () => {};
const keyNum = (key: string) => {
  const n = Number(key.split('-')[1]);
  return Number.isFinite(n) ? n : undefined;
};

/* ── 작업 ─────────────────────────────────────────────────── */

export function useRemoteTaskStore(opts: StoreOptions = {}): Store {
  const { items, ready, sync, loadError, deleted, eng } = useRowSync<Task, TaskRow>({
    table: 'tm_tasks', fromRow: taskFromRow, toRow: taskToRow, onError: opts.onError,
    texts: {
      gone: '다른 팀원이 지운 작업이라 고치던 내용을 저장하지 못했습니다.',
      createFail: (title) => `${title ? `'${title}' ` : '새 '}작업을 만들지 못했습니다. 서버가 받아 주지 않아 목록에서 뺐습니다.`,
    },
  });

  /* 되돌리기 - 마지막 한 동작(지우기 · 상태 옮기기 · 캘린더에서 마감일 옮기기)만 거꾸로 되돌린다.
     브라우저 저장 모드처럼 전체를 통째로 되돌리면 그 사이 다른 사람이 고친 것까지 지워진다.
     되돌릴 때 그 줄이 그 동작 직후 그대로인지 보고, 그사이 누가 바꿨으면 손대지 않는다. */
  const last = useRef<(() => boolean) | null>(null);
  const [undoState, setUndoState] = useState<{ label: string | null; seq: number }>({ label: null, seq: 0 });
  const push = useCallback((label: string, revert: () => boolean) => {
    last.current = revert;
    setUndoState((s) => ({ label, seq: s.seq + 1 }));
  }, []);
  const dropUndo = useCallback(() => {
    last.current = null;
    setUndoState((s) => (s.label === null ? s : { ...s, label: null }));
  }, []);
  const undo = useCallback(() => {
    const revert = last.current;
    dropUndo();
    return revert ? revert() : false;
  }, [dropUndo]);

  const create = useCallback<Store['create']>((input) => {
    const now = new Date().toISOString();
    const status = input.status ?? 'todo';
    // 새 작업은 그 상태 칸 맨 위로
    const column = eng.items.filter((t) => t.status === status);
    const top = column.length ? Math.min(...column.map((t) => t.order)) - 1000 : 1000;
    const task: Task = {
      id: crypto.randomUUID(),
      key: PENDING_KEY,
      title: input.title,
      description: input.description ?? '',
      status,
      priority: input.priority ?? 'normal',
      domain: input.domain ?? 'ops',
      assignee: input.assignee ?? null,
      start: input.start ?? null,
      due: input.due ?? null,
      labels: input.labels ?? [],
      order: top,
      createdAt: now,
      updatedAt: now,
    };
    eng.create(task, { id: task.id, ...taskToRow(task) });
    return task;
  }, [eng]);

  const update = useCallback<Store['update']>((id, patch, undoLabel) => {
    const was = undoLabel ? eng.items.find((t) => t.id === id) : undefined;
    if (undoLabel && was) {
      const keys = Object.keys(patch) as (keyof Task)[];
      const back = Object.fromEntries(keys.map((k) => [k, was[k]])) as Partial<Task>;
      push(undoLabel, () => {
        // 그사이 다른 사람이 그 칸을 또 바꿨거나 지웠으면 되돌리지 않는다
        const cur = eng.items.find((t) => t.id === id);
        if (!cur || keys.some((k) => cur[k] !== patch[k])) return false;
        eng.patch(id, { ...back, updatedAt: new Date().toISOString() }, true);
        return true;
      });
    }
    eng.patch(id, { ...patch, updatedAt: new Date().toISOString() });
  }, [eng, push]);

  const remove = useCallback<Store['remove']>((id) => {
    const gone = eng.items.find((t) => t.id === id);
    if (!gone) return;
    push(`'${gone.title || '작업'}' 삭제`, () => {
      // 그사이 누가 되살렸으면 두 번 만들지 않는다
      if (eng.items.some((t) => t.id === id)) return false;
      // 같은 번호로 되살린다 - 문서에 적어 둔 MATE-### 가 그대로 이어진다
      eng.create(gone, {
        id: gone.id, num: keyNum(gone.key), ...taskToRow(gone), created_at: gone.createdAt,
      } as Partial<TaskRow> & { id: string }, true);
      return true;
    });
    eng.remove([id], id);
  }, [eng, push]);

  const move = useCallback<Store['move']>((id, status, beforeId) => {
    const moving = eng.items.find((t) => t.id === id);
    if (!moving) return;
    const column = eng.items
      .filter((t) => t.status === status && t.id !== id)
      .sort((a, b) => a.order - b.order);
    const at = beforeId ? column.findIndex((t) => t.id === beforeId) : column.length;
    const idx = at < 0 ? column.length : at;
    const prev = column[idx - 1];
    const next = column[idx];

    // 앞뒤 카드 사이 값 하나만 고친다 - 칸 전체에 번호를 다시 매기면 여러 줄을 보내야 한다
    let order = prev && next ? (prev.order + next.order) / 2 : prev ? prev.order + 1000 : next ? next.order - 1000 : 1000;
    if (prev && next && next.order - prev.order < 1e-6) {
      // 같은 자리에 수십 번 끼워 넣어 사이가 바닥나면 그때만 칸 전체를 다시 매긴다
      [...column.slice(0, idx), moving, ...column.slice(idx)].forEach((t, i) => {
        const o = (i + 1) * 1000;
        if (t.id === id) order = o;
        else if (t.order !== o) eng.patch(t.id, { order: o }, true);
      });
    }
    if (moving.status === status && moving.order === order) return;

    if (moving.status !== status) {
      const back = { status: moving.status, order: moving.order };
      const to = { status, order };
      push(`'${moving.title || '작업'}' 상태 변경`, () => {
        // 그사이 다른 사람이 옮겼거나 지웠으면 되돌리지 않는다
        const cur = eng.items.find((t) => t.id === id);
        if (!cur || cur.status !== to.status || cur.order !== to.order) return false;
        eng.patch(id, { ...back, updatedAt: new Date().toISOString() }, true);
        return true;
      });
    }
    eng.patch(id, { status, order, updatedAt: new Date().toISOString() }, true);
  }, [eng, push]);

  const flush = useCallback(() => eng.flushAll(), [eng]);
  const reload = useCallback(async () => {
    await eng.reload();
  }, [eng]);

  return {
    tasks: items, ready, persistent: true, sync, loadError, deletedElsewhere: deleted,
    create, update, remove, move, flush, reload,
    reset: noop, clearSamples: noop,
    undoLabel: undoState.label, undoSeq: undoState.seq, undo, dropUndo,
  };
}

/* ── 문서 ─────────────────────────────────────────────────── */

export function useRemoteDocStore(opts: StoreOptions = {}): DocStore {
  const { items, ready, sync, loadError, deleted, eng } = useRowSync<Doc, DocRow>({
    table: 'tm_docs', fromRow: docFromRow, toRow: docToRow, onError: opts.onError,
    texts: {
      gone: '다른 팀원이 지운 문서라 고치던 내용을 저장하지 못했습니다.',
      createFail: (title) => `${title ? `'${title}' ` : '새 '}문서를 만들지 못했습니다. 서버가 받아 주지 않아 목록에서 뺐습니다.`,
    },
  });

  const create = useCallback<DocStore['create']>((input) => {
    const now = new Date().toISOString();
    const doc: Doc = {
      id: crypto.randomUUID(),
      title: input.title,
      parentId: input.parentId,
      body: input.body,
      author: input.author,
      labels: [],
      order: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    eng.create(doc, { id: doc.id, ...docToRow(doc) });
    return doc;
  }, [eng]);

  const update = useCallback<DocStore['update']>((id, patch) => {
    eng.patch(id, { ...patch, updatedAt: new Date().toISOString() });
  }, [eng]);

  const remove = useCallback<DocStore['remove']>((id) => {
    const doomed = new Set<string>([id]);
    let grew = true;
    while (grew) {
      grew = false;
      eng.items.forEach((d) => {
        if (d.parentId && doomed.has(d.parentId) && !doomed.has(d.id)) {
          doomed.add(d.id);
          grew = true;
        }
      });
    }
    eng.remove([...doomed], id);
  }, [eng]);

  const flush = useCallback(() => eng.flushAll(), [eng]);
  const reload = useCallback(async () => {
    await eng.reload();
  }, [eng]);

  return {
    docs: items, ready, sync, loadError, deletedElsewhere: deleted,
    create, update, remove, flush, reload, clearSamples: noop,
  };
}

/* ── 개인 메모 ────────────────────────────────────────────── */

/* 표의 RLS 가 쓴 사람의 줄만 돌려주고 실시간도 그 줄만 보낸다 - 다른 팀원의 메모는 이 브라우저에 오지 않는다 */
export function useRemoteMemoStore(opts: StoreOptions = {}): MemoStore {
  const { items, ready, sync, loadError, deleted, eng } = useRowSync<Memo, MemoRow>({
    table: 'tm_memos', fromRow: memoFromRow, toRow: memoToRow, onError: opts.onError,
    texts: {
      gone: '다른 창이나 기기에서 지운 메모라 고치던 내용을 저장하지 못했습니다.',
      createFail: () => '새 메모를 만들지 못했습니다. 서버가 받아 주지 않아 목록에서 뺐습니다.',
    },
  });

  const create = useCallback<MemoStore['create']>((owner, text = {}) => {
    const now = new Date().toISOString();
    const memo: Memo = {
      id: crypto.randomUUID(), owner, title: text.title ?? '', body: text.body ?? '', createdAt: now, updatedAt: now,
    };
    eng.create(memo, { id: memo.id, owner, ...memoToRow(memo) });
    return memo;
  }, [eng]);

  const update = useCallback<MemoStore['update']>((id, patch) => {
    eng.patch(id, { ...patch, updatedAt: new Date().toISOString() });
  }, [eng]);

  const remove = useCallback<MemoStore['remove']>((id) => eng.remove([id], id), [eng]);

  const flush = useCallback(() => eng.flushAll(), [eng]);
  const reload = useCallback(async () => {
    await eng.reload();
  }, [eng]);

  return { memos: items, ready, sync, loadError, deletedElsewhere: deleted, create, update, remove, flush, reload };
}

/* ── 이 브라우저에 남은 예전 데이터 옮기기 ───────────────────
   Supabase 로 옮기기 전에는 각자 브라우저(localStorage)에 저장했다. 사람이 만든 작업 · 문서가
   남아 있으면 한 번에 올린다. 예시 데이터는 올리지 않고, 브라우저의 원본은 지우지 않는다.
   작업 번호는 Supabase 가 새로 매기므로, 문서와 설명에 적힌 MATE-### 를 새 번호로 바꿔 적는다. */

const IMPORT_KEY = 'mate.taskmanager.imported.v1';
/**
 * tasks = 작업을 넣기 직전. 작업마다 미리 정한 새 id(옛 id → 새 id) - 넣었는데 답을 못 받고 끊겨도 같은 id 로 다시 넣어 두 번 생기지 않는다.
 * docs = 작업까지 옮기고 문서에서 멈췄다. keyMap 으로 다시 누를 때 작업을 두 번 올리지 않고,
 * rewrite 에는 설명 속 번호를 아직 못 바꾼 작업([새 id, 옛 id])이 남는다.
 * docIds 는 문서를 넣기 직전에 정한 새 id(옛 id → 새 id) - 작업의 plan 과 같은 까닭이다.
 */
type ImportMark =
  | { state: 'done' | 'skip' }
  | { state: 'tasks'; plan: Record<string, string> }
  | { state: 'docs'; keyMap: Record<string, string>; rewrite?: [string, string][]; docIds?: Record<string, string> };

function readJson<V>(key: string): V | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as V) : null;
  } catch {
    return null;
  }
}
function writeMark(mark: ImportMark) {
  try {
    window.localStorage.setItem(IMPORT_KEY, JSON.stringify(mark));
  } catch { /* 저장이 막혀 있으면 다음에 다시 묻는다 */ }
}

export function localLeftovers(): { tasks: Task[]; docs: Doc[] } | null {
  const mark = readJson<ImportMark>(IMPORT_KEY);
  if (mark && mark.state !== 'docs' && mark.state !== 'tasks') return null;
  const tasks = mark?.state === 'docs' ? [] : (readJson<Task[]>(LOCAL_TASKS_KEY) ?? []).filter((t) => !isUntouchedSample(t));
  const docs = (readJson<Doc[]>(LOCAL_DOCS_KEY) ?? []).filter((d) => !isUntouchedSampleDoc(d));
  return tasks.length || docs.length ? { tasks, docs } : null;
}

export function skipImport() {
  writeMark({ state: 'skip' });
}

export async function importLocal(userId: string): Promise<{ tasks: number; docs: number }> {
  const left = localLeftovers();
  if (!left) return { tasks: 0, docs: 0 };
  const mark = readJson<ImportMark>(IMPORT_KEY);
  const keyMap: Record<string, string> = mark?.state === 'docs' ? mark.keyMap : {};
  let rewrite: [string, string][] = mark?.state === 'docs' ? mark.rewrite ?? [] : [];
  const docIds: Record<string, string> = mark?.state === 'docs' ? mark.docIds ?? {} : {};
  const swap = (text: string) => text.replace(/MATE-\d+/g, (k) => keyMap[k] ?? k);

  if (left.tasks.length) {
    // 브라우저에서 '나'로 고른 사람이 맡은 작업만 지금 계정에 붙인다. 자리표시 팀원(개발 1 …)은 미배정으로
    const localMe = (() => {
      try { return window.localStorage.getItem(LOCAL_ME_KEY) ?? 'm7'; } catch { return 'm7'; }
    })();
    const plan = mark?.state === 'tasks' ? mark.plan : {};
    const rows = left.tasks
      .slice()
      .sort((a, b) => (keyNum(a.key) ?? 0) - (keyNum(b.key) ?? 0))
      .map((old) => ({ id: plan[old.id] ?? crypto.randomUUID(), old }));
    // 넣기 전에 새 id 를 적어 둔다 - 넣고 나서 답을 못 받아도 다시 누르면 같은 줄로 보고 건너뛴다
    writeMark({ state: 'tasks', plan: Object.fromEntries(rows.map(({ id, old }) => [old.id, id])) });
    const { data, error } = await sb()
      .from('tm_tasks')
      .upsert(rows.map(({ id, old }) => ({
        id,
        ...taskToRow({ ...old, assignee: old.assignee === localMe ? userId : null }),
        created_at: old.createdAt,
        updated_at: old.updatedAt,
      })), { onConflict: 'id', ignoreDuplicates: true })
      .select('id,num');
    if (error) throw new Error(error.message);
    const nums = new Map((data as { id: string; num: number }[]).map((r) => [r.id, r.num]));
    // 앞서 들어간 줄은 위에서 건너뛰어 번호가 오지 않는다 - 따로 읽는다
    const missing = rows.filter(({ id }) => !nums.has(id)).map(({ id }) => id);
    if (missing.length) {
      const got = await sb().from('tm_tasks').select('id,num').in('id', missing);
      if (got.error) throw new Error(got.error.message);
      (got.data as { id: string; num: number }[]).forEach((r) => nums.set(r.id, r.num));
    }
    rows.forEach(({ id, old }) => {
      const n = nums.get(id);
      if (n !== undefined) keyMap[old.key] = `MATE-${n}`;
    });
    rewrite = rows.filter(({ old }) => /MATE-\d+/.test(old.description)).map(({ id, old }): [string, string] => [id, old.id]);
    // 작업은 들어갔다 - 바로 적어 두어 아래에서 멈춰도 다시 누를 때 작업을 또 올리지 않는다
    writeMark({ state: 'docs', keyMap, rewrite, docIds });
  }

  if (rewrite.length) {
    // 설명 속 번호 바꾸기는 덤이다 - 실패해도 멈추지 않고 남은 것은 표시에 적어 다음에 마저 한다.
    // 브라우저의 원본에서 바꾸고, 서버 설명이 아직 원본 그대로일 때만 덮는다(그사이 누가 고쳤으면 두고, 두 번 해도 같다)
    const originals = new Map((readJson<Task[]>(LOCAL_TASKS_KEY) ?? []).map((t) => [t.id, t]));
    for (const [id, oldId] of rewrite.slice()) {
      const old = originals.get(oldId);
      if (old) {
        const res = await sb().from('tm_tasks').update({ description: swap(old.description) })
          .eq('id', id).eq('description', old.description);
        if (res.error) continue;
      }
      rewrite = rewrite.filter(([n]) => n !== id);
      writeMark({ state: 'docs', keyMap, rewrite, docIds });
    }
  }

  if (left.docs.length) {
    // 넣기 전에 새 id 를 적어 둔다 - 넣고 나서 답을 못 받아도 다시 누르면 같은 줄로 보고 건너뛴다
    left.docs.forEach((d) => {
      if (!docIds[d.id]) docIds[d.id] = crypto.randomUUID();
    });
    writeMark({ state: 'docs', keyMap, rewrite, docIds });
    const ids = new Map(left.docs.map((d) => [d.id, docIds[d.id]]));
    const byId = new Map(left.docs.map((d) => [d.id, d]));
    const depth = (d: Doc) => {
      let n = 0;
      let cur = d.parentId;
      while (cur && byId.has(cur) && n < 50) {
        n += 1;
        cur = byId.get(cur)?.parentId ?? null;
      }
      return n;
    };
    // 위 문서가 먼저 들어가게 깊이 순으로. 위 문서가 예시라 옮기지 않았으면 최상위로
    const ordered = left.docs.slice().sort((a, b) => depth(a) - depth(b));
    const { error } = await sb()
      .from('tm_docs')
      .upsert(ordered.map((d) => ({
        id: ids.get(d.id),
        parent_id: d.parentId && ids.has(d.parentId) ? ids.get(d.parentId) : null,
        title: d.title,
        body: swap(d.body),
        author: userId,
        labels: d.labels ?? [],
        sort: d.order,
        created_at: d.createdAt,
        updated_at: d.updatedAt,
      })), { onConflict: 'id', ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }

  writeMark({ state: 'done' });
  return { tasks: left.tasks.length, docs: left.docs.length };
}
