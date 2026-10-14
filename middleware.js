// Accesso protetto da password per tutte le pagine del progetto.
// La password si cambia dalla variabile d'ambiente SITE_PASSWORD su Vercel (default: quella concordata).
export const config = { matcher: ['/((?!gate/|_vercel|favicon\\.ico).*)'] };

const COOKIE = 'gs_gate';
const TOKEN = 'b7f3c9e1a24d4f0e9c6a5d8b31e7f2a6';

const safeNext = (n) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/');

export default async function middleware(request) {
  const url = new URL(request.url);
  const pass = (typeof process !== 'undefined' && process.env && process.env.SITE_PASSWORD) || 'apriti';

  if ((url.pathname === '/__auth' || url.pathname === '/__auth/') && request.method === 'POST') {
    const form = await request.formData();
    const next = safeNext(String(form.get('next') || '/'));
    if (String(form.get('password') || '') === pass) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: next,
          'Set-Cookie': `${COOKIE}=${TOKEN}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return new Response(null, { status: 303, headers: { Location: `/gate/?e=1&next=${encodeURIComponent(next)}` } });
  }

  const cookie = request.headers.get('cookie') || '';
  if (cookie.split(/;\s*/).includes(`${COOKIE}=${TOKEN}`)) {
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }

  return new Response(null, {
    status: 307,
    headers: { Location: `/gate/?next=${encodeURIComponent(url.pathname + url.search)}`, 'Cache-Control': 'no-store' },
  });
}
