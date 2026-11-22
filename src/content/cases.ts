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

// Todo texto sai do projectData antigo (overview/details); nada de pesquisa ou métrica inventada.
export const CASES: readonly CaseFile[] = [
  {
    slug: 'criptenv',
    number: 1,
    name: 'CRIPTENV',
    theCase: 'Teams need to manage .env files and API keys without handing their secrets to a server.',
    clues: [
      'Secrets must be encrypted on the device before anything leaves it.',
      'The vault password is created on the client and never sent to the API.',
      'The workflow is CLI-first, with a web dashboard and CI usage.',
    ],
    solution:
      'An open source alternative to Doppler and Infisical. Secrets are encrypted with AES-256-GCM on the device, so the server only stores encrypted blobs. It adds blob versioning, an audit trail and team invitations, and runs on my own VPS behind Cloudflare.',
    stack: ['Python', 'FastAPI', 'Next.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Cloudflare'],
    url: 'https://criptenv.77mdevseven.tech',
    screenshot: { desktop: '/static/projects/criptenv.jpg', mobile: '/static/projects/criptenv-mobile.jpg' },
  },
  {
    slug: 'ateliesys',
    number: 2,
    name: 'ATELIESYS',
    theCase: 'Beauty studios (nails, brows, lashes and hair) need online booking that fits the way they already confirm on WhatsApp.',
    clues: [
      'Each studio needs its own booking link and subdomain.',
      'Clients pick a service and a time; the studio confirms on WhatsApp.',
      'Deposits are paid by Pix through Stripe Connect.',
    ],
    solution:
      'A multi-tenant SaaS with an agenda, teams, a WhatsApp assistant on the official Cloud API that answers and books for the studio, and monthly or yearly plans. It runs on my own VPS, with a synthetic test of the main flow every 15 minutes.',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'WhatsApp Cloud API', 'OpenAI', 'Docker'],
    url: 'https://ateliesys.tech',
    screenshot: { desktop: '/static/projects/ateliesys.jpg', mobile: '/static/projects/ateliesys-mobile.jpg' },
  },
  {
    slug: 'lene-studio-beauty',
    number: 3,
    name: 'LENE STUDIO BEAUTY',
    theCase: 'A hair salon in Presidente Prudente needed a website that presents its work and takes bookings on WhatsApp.',
    clues: [
      'It must work well on a phone, with one button straight to the chat.',
      'Services are shown with their duration, next to a before and after slider.',
      "Reviews arrive through WhatsApp and are published with the owner's approval.",
    ],
    solution:
      "A fast website with a gallery, the owner's story, opening hours and a Google Maps route to the salon. Security headers (HSTS with preload, CSP, frame protection) and a CI/CD pipeline come included.",
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
    theCase: 'Sending raw match data to a language model costs tokens and lets it invent numbers.',
    clues: [
      "Match data comes in Riot's official VAL-MATCH-V1 format.",
      'Metrics are derived from it: KAST, ADR, ACS, first bloods and round economy.',
      'The model must only receive the computed summary.',
    ],
    solution:
      'A three-layer contract for the AI coach: exact numbers, a rating by range and pre-computed coaching hooks. The model spends fewer tokens and cannot fabricate data. It is a prototype running on simulated data, tested with Vitest.',
    stack: ['Next.js', 'TypeScript', 'Vitest', 'Docker', 'Vercel', 'LLM API'],
    url: 'https://range77.vercel.app',
    screenshot: { desktop: '/static/projects/range77.jpg', mobile: '/static/projects/range77-mobile.jpg' },
  },
];
