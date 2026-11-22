export type CaseFile = {
  slug: 'criptenv' | 'ateliesys' | 'lene-studio-beauty' | 'range77';
  number: 1 | 2 | 3 | 4;
  name: string;
  theCase: string;
  clues: string[];
  solution: string;
  stack: string[];
  url: string | null;
  screenshot: { desktop: string; mobile: string };
};

export const CASES: readonly CaseFile[] = [
  {
    slug: 'criptenv',
    number: 1,
    name: 'CRIPTENV',
    theCase: 'Teams share passwords and API keys in chats and .env files, and every shared secret is a leak waiting to happen.',
    clues: [
      'Developers want a CLI first, not another dashboard.',
      'Teams only trust a vault whose server never sees a secret.',
      'Open source tools win trust faster than closed ones.',
    ],
    solution:
      'An open source, zero-knowledge vault: secrets are encrypted with AES-256-GCM on the device before anything reaches the server, and the vault password never leaves the client. CLI-first, with a web dashboard, CI support, audit trail and team invitations.',
    stack: ['Python', 'FastAPI', 'Next.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Cloudflare'],
    url: 'https://criptenv.77mdevseven.tech',
    screenshot: { desktop: '/static/projects/criptenv.jpg', mobile: '/static/projects/criptenv-mobile.jpg' },
  },
  {
    slug: 'ateliesys',
    number: 2,
    name: 'ATELIESYS',
    theCase: 'Beauty studios lose clients in endless WhatsApp back-and-forth just to agree on a time slot.',
    clues: [
      'Clients want to book from a link, in a few taps.',
      'Studios live on WhatsApp and will not leave it.',
      'No-shows drop when a deposit is paid upfront.',
    ],
    solution:
      'A multi-tenant booking SaaS: each studio gets its own link, clients pick a service and a time, and the studio confirms on WhatsApp. It adds teams, a WhatsApp assistant that answers clients, and deposits paid by Pix.',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'WhatsApp Cloud API', 'OpenAI', 'Docker'],
    url: 'https://ateliesys.tech',
    screenshot: { desktop: '/static/projects/ateliesys.jpg', mobile: '/static/projects/ateliesys-mobile.jpg' },
  },
  {
    slug: 'lene-studio-beauty',
    number: 3,
    name: 'LENE STUDIO BEAUTY',
    theCase: 'A hair salon in Presidente Prudente had no website, so new clients could not see its work or book a visit.',
    clues: [
      'Almost every visitor comes from a phone.',
      'Before and after photos sell better than any description.',
      'Clients would rather talk on WhatsApp than fill in a form.',
    ],
    solution:
      'A fast mobile-first website with one button straight to the chat: services with duration, a before and after slider, a gallery, reviews, opening hours and a map route to the salon.',
    stack: ['Next.js', 'Tailwind CSS', 'Vercel'],
    url: 'https://lenestudiobeauty.vercel.app/',
    screenshot: {
      desktop: '/static/projects/lenestudiobeauty.jpg',
      mobile: '/static/projects/lenestudiobeauty-mobile.jpg',
    },
  },
  {
    slug: 'range77',
    number: 4,
    name: 'RANGE77',
    theCase: 'Valorant players get raw numbers after a match, but no clear advice on what to fix, and sending raw data to an AI is slow and costly.',
    clues: [
      'Players want a diagnosis, not a table of stats.',
      'A model fed raw data wastes tokens and can invent numbers.',
    ],
    solution:
      'An AI coach that only receives a computed summary: exact metrics (KAST, ADR, ACS, first bloods), a rating by range and ready-made coaching hooks. Fewer tokens, no fabricated data. Prototype running on simulated matches.',
    stack: ['Next.js', 'TypeScript', 'Vitest', 'Docker', 'Vercel', 'LLM API'],
    url: 'https://range77.vercel.app',
    screenshot: { desktop: '/static/projects/range77.jpg', mobile: '/static/projects/range77-mobile.jpg' },
  },
];
