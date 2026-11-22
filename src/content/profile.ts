export const PROFILE: {
  name: 'DIAS77';
  role: 'Creative developer · Full cycle & AI';
  about: string[];
  specialties: { title: 'Frontend & Product' | 'AI & Automation' | 'Backend & Infrastructure'; items: { label: string; text: string }[] }[];
  portrait: { src: '/static/hero/image-4.webp'; alt: string };
} = {
  name: 'DIAS77',
  role: 'Creative developer · Full cycle & AI',
  about: [
    "I'm Jean, 21, a developer from Presidente Prudente studying at UNOESTE.",
    'Before code, I worked behind a retail sales counter, where I learned to listen to what people actually need.',
    'I take a product from idea to production: interface, backend, infrastructure and AI.',
  ],
  specialties: [
    {
      title: 'Frontend & Product',
      items: [
        { label: 'Stack', text: 'Next.js, React, TypeScript, Tailwind CSS' },
        { label: 'Motion', text: 'GSAP, CSS animation, scroll-driven pages' },
        { label: 'Builds', text: 'Mobile-first landing pages, SaaS dashboards, WhatsApp-first flows' },
      ],
    },
    {
      title: 'AI & Automation',
      items: [
        { label: 'Models', text: 'OpenAI, Anthropic Claude, structured prompt contracts' },
        { label: 'Agents', text: 'WhatsApp assistant on the Cloud API, audio transcription' },
        { label: 'Flows', text: 'n8n workflows, scheduled reminders, webhooks' },
      ],
    },
    {
      title: 'Backend & Infrastructure',
      items: [
        { label: 'Core', text: 'Python, FastAPI, Node.js, PostgreSQL' },
        { label: 'Billing', text: 'Stripe Billing, Stripe Connect (Pix), webhooks' },
        { label: 'Ops', text: 'Docker, VPS, Cloudflare, GitHub Actions (self-hosted runner)' },
      ],
    },
  ],
  portrait: { src: '/static/hero/image-4.webp', alt: 'Portrait of the detective, the DIAS77 character' },
};
