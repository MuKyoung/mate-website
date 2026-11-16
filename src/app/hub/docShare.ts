'use client';

import { useCallback, useEffect, useState } from 'react';
import { isMissingTable, isRemote, sb } from './supabase';

/*
 * 위키 문서 링크 공유(tm_doc_shares) - 문서마다 링크 하나.
 * 링크를 아는 사람은 로그인 없이 /hub/share/<열쇠>/ 에서 그 문서 하나만 읽는다(share/[token]/page.tsx).
 * 팀원만 링크를 만들고 끊는다. 열쇠는 DB 가 만든다(supabase/taskmanager.sql 의 '위키 문서 링크 공유').
 * Supabase 없이 도는 브라우저 저장 모드에는 공유가 없다 - 밖에서 읽어 갈 서버가 없다
 */

export interface DocShare {
  docId: string;
  token: string;
  createdBy: string | null;
  createdAt: string;
}

interface ShareRow { doc_id: string; token: string; created_by: string | null; created_at: string }

const COLS = 'doc_id, token, created_by, created_at';
const fromRow = (r: ShareRow): DocShare => ({ docId: r.doc_id, token: r.token, createdBy: r.created_by, createdAt: r.created_at });

/** 공유 링크 주소. 이 사이트는 주소 끝에 / 를 붙여 쓴다(next.config.js trailingSlash) */
export function shareUrl(token: string): string {
  return `${window.location.origin}/hub/share/${token}/`;
}

/** off = 브라우저 저장 모드 · missing = 표가 아직 없다(SQL 을 실행하지 않았다) */
export type ShareState = 'off' | 'loading' | 'ready' | 'missing' | 'error';

export const SHARE_MISSING = "공유 표가 아직 없습니다. 관리자가 supabase/taskmanager.sql 의 '위키 문서 링크 공유' 부분을 실행해야 합니다";

export interface DocShares {
  state: ShareState;
  byDoc: ReadonlyMap<string, DocShare>;
  reload(): Promise<void>;
  /** 링크를 만든다. 다른 팀원이 먼저 만들었으면 그 링크를 돌려준다. 못 만들면 까닭(글) */
  create(docId: string): Promise<DocShare | string>;
  /** 링크를 끊는다. 못 끊으면 까닭(글) */
  revoke(docId: string): Promise<true | string>;
}

export function useDocShares(): DocShares {
  const [state, setState] = useState<ShareState>(isRemote ? 'loading' : 'off');
  const [byDoc, setByDoc] = useState<ReadonlyMap<string, DocShare>>(() => new Map());

  const reload = useCallback(async () => {
    if (!isRemote) return;
    const { data, error } = await sb().from('tm_doc_shares').select(COLS);
    if (error) {
      setState(isMissingTable(error) ? 'missing' : 'error');
      return;
    }
    setByDoc(new Map((data as ShareRow[]).map((r) => [r.doc_id, fromRow(r)])));
    setState('ready');
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(async (docId: string): Promise<DocShare | string> => {
    if (!isRemote) return '브라우저 저장 모드에서는 링크로 공유할 수 없습니다';
    const { data, error } = await sb().from('tm_doc_shares').insert({ doc_id: docId }).select(COLS).single();
    if (!error && data) {
      const s = fromRow(data as ShareRow);
      setByDoc((m) => new Map(m).set(docId, s));
      setState('ready');
      return s;
    }
    if (isMissingTable(error)) {
      setState('missing');
      return SHARE_MISSING;
    }
    // 같은 문서의 링크가 이미 있다(다른 팀원이 먼저 만들었다) - 그 링크를 읽어 온다
    if (error?.code === '23505') {
      const again = await sb().from('tm_doc_shares').select(COLS).eq('doc_id', docId).maybeSingle();
      if (again.data) {
        const s = fromRow(again.data as ShareRow);
        setByDoc((m) => new Map(m).set(docId, s));
        return s;
      }
    }
    // 문서가 서버에 아직 없다(방금 만들어 보내는 중) - 외래 키
    if (error?.code === '23503') return '문서가 아직 저장되지 않았습니다. 잠시 뒤 다시 눌러 주세요';
    return '링크를 만들지 못했습니다. 인터넷 연결을 확인하고 다시 눌러 주세요';
  }, []);

  const revoke = useCallback(async (docId: string): Promise<true | string> => {
    if (!isRemote) return '브라우저 저장 모드에서는 링크로 공유할 수 없습니다';
    const { error } = await sb().from('tm_doc_shares').delete().eq('doc_id', docId);
    if (error) return isMissingTable(error) ? SHARE_MISSING : '링크를 끊지 못했습니다. 인터넷 연결을 확인하고 다시 눌러 주세요';
    setByDoc((m) => {
      const next = new Map(m);
      next.delete(docId);
      return next;
    });
    return true;
  }, []);

  return { state, byDoc, reload, create, revoke };
}
