// Confere o token do Turnstile na Cloudflare. Qualquer falha (sem token, rede, resposta ruim) = não aprovado.
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token, secret, ip, fetchFn = fetch) {
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: ip });
    const res = await fetchFn(SITEVERIFY, { method: 'POST', body });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
