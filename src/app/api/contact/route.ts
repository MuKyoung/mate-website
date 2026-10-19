import { Resend } from 'resend';
import { domains } from '@/data/domains';
import { CONTACT_EMAIL } from '@/lib/styles';

/**
 * 견적 문의 - /contact 양식을 Resend 로 메일 보낸다.
 *
 * 환경 변수 (Vercel 프로젝트 설정)
 *   RESEND_API_KEY     필수. 없으면 503 을 돌려주고, 양식은 메일 초안 열기로 넘어간다.
 *   RESEND_FROM_EMAIL  보내는 주소. Resend 에서 인증한 도메인이어야 한다.
 *                      주소만 적으면(inquiry@devteammate.co.kr) 보내는 이름 'MATE 문의'를 붙인다.
 *                      비워 두면 Resend 시험 주소(onboarding@resend.dev)로 보내는데,
 *                      이 주소는 Resend 계정 주인의 메일로만 보낼 수 있다.
 *   CONTACT_TO_EMAIL   받는 주소. 비워 두면 사이트에 적힌 연락 메일(CONTACT_EMAIL).
 *
 * 답장은 문의한 사람에게 바로 가도록 reply-to 를 그 사람 주소로 둔다.
 */

export const dynamic = 'force-dynamic';

const LIMIT = { name: 100, email: 200, subject: 200, message: 5000 } as const;
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

type Field = keyof typeof LIMIT;

const fail = (status: number, error: string) => Response.json({ ok: false, error }, { status });

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return fail(503, 'not_configured');

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail(400, 'invalid_body');
  }

  // 사람에게는 보이지 않는 칸 - 채워져 있으면 자동 입력 봇이다. 성공한 척하고 보내지 않는다
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return Response.json({ ok: true });
  }

  const v = {} as Record<Field, string>;
  for (const key of Object.keys(LIMIT) as Field[]) {
    const raw = body[key];
    const s = typeof raw === 'string' ? raw.trim() : '';
    if (!s) return fail(400, `missing_${key}`);
    if (s.length > LIMIT[key]) return fail(400, `too_long_${key}`);
    v[key] = s;
  }
  if (!EMAIL_RE.test(v.email)) return fail(400, 'invalid_email');

  const domainLabel = domains.find((d) => d.key === body.domain)?.kr ?? '미지정';
  // 제목 줄에는 줄바꿈이 들어가지 않게 한다
  const subject = `[MATE 문의] ${domainLabel === '미지정' ? '' : `${domainLabel} | `}${v.subject}`.replace(/[\r\n]+/g, ' ');

  const rows: [string, string][] = [
    ['문의 영역', domainLabel],
    ['이름', v.name],
    ['회신 이메일', v.email],
    ['제목', v.subject],
  ];
  const text = [...rows.map(([k, val]) => `${k}: ${val}`), '', v.message].join('\n');
  const html = `<div style="font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;font-size:15px;line-height:1.7;color:#111">
<table style="border-collapse:collapse;margin-bottom:20px">${rows
    .map(([k, val]) => `<tr><td style="padding:4px 16px 4px 0;color:#666;white-space:nowrap">${k}</td><td style="padding:4px 0">${escapeHtml(val)}</td></tr>`)
    .join('')}</table>
<div style="white-space:pre-wrap;border-top:1px solid #ddd;padding-top:16px">${escapeHtml(v.message)}</div>
</div>`;

  // 환경 변수에는 주소만 두고 한글 이름은 여기서 붙인다 - 설정 화면에서 한글이 깨질 일이 없게
  const fromEnv = process.env.RESEND_FROM_EMAIL?.trim();
  const from = !fromEnv
    ? 'MATE 문의 <onboarding@resend.dev>'
    : fromEnv.includes('<') ? fromEnv : `MATE 문의 <${fromEnv}>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: process.env.CONTACT_TO_EMAIL || CONTACT_EMAIL,
    replyTo: v.email,
    subject,
    text,
    html,
  });

  if (error) {
    console.error('[contact] resend error', error.name, error.message);
    return fail(502, 'send_failed');
  }
  return Response.json({ ok: true });
}
