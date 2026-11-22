// Turnstile (Cloudflare, invisível): um token novo a cada mensagem.
type Turnstile = {
  render(container: string, opts: Record<string, unknown>): string;
  execute(widget: string): void;
  reset(widget: string): void;
};
declare global { interface Window { turnstile?: Turnstile } }

// Em localhost, a chave de teste que sempre aprova.
const SITE_KEY = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? '1x00000000000000000000BB'
  : '0x4AAAAAAGMqWO7gw7Me7Zju';

let loading: Promise<Turnstile> | null = null;
let widget: string | null = null;
let used = false;
let pending: { resolve: (t: string) => void; reject: (e: Error) => void } | null = null;

function load() {
  loading ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => resolve(window.turnstile!);
    script.onerror = () => { loading = null; reject(new Error('turnstile indisponível')); };
    document.head.appendChild(script);
  });
  return loading;
}

// O prazo vale para tudo (carregar o script + gerar o token): rede pendurada não pode travar o chat.
export function getTurnstileToken(container: string): Promise<string> {
  let timer = 0;
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => {
      if (!window.turnstile) loading = null; // na próxima tentativa, carrega o script de novo
      reject(new Error('turnstile demorou'));
    }, 15_000);
  });
  const token = load().then((turnstile) => new Promise<string>((resolve, reject) => {
    pending = { resolve, reject };
    if (widget === null) {
      widget = turnstile.render(container, {
        sitekey: SITE_KEY,
        execution: 'execute',
        appearance: 'interaction-only',
        callback: (t: string) => pending?.resolve(t),
        'error-callback': () => pending?.reject(new Error('turnstile falhou')),
      });
    } else if (used) {
      turnstile.reset(widget);
    }
    used = true;
    turnstile.execute(widget);
  }));
  return Promise.race([token, timeout]).finally(() => { clearTimeout(timer); pending = null; });
}
