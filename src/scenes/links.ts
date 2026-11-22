import { CONTACT } from '../content/contact.ts';

// Mesmos canais no contato e no rodapé; só o e-mail abre no mesmo contexto.
export const CHANNELS = [
  { label: 'Email', href: `mailto:${CONTACT.email}`, external: false },
  { label: 'WhatsApp', href: CONTACT.whatsapp, external: true },
  { label: 'GitHub', href: CONTACT.github, external: true },
  { label: 'LinkedIn', href: CONTACT.linkedin, external: true },
] as const;
