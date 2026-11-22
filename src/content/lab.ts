import type { JP } from './jp.ts';

export type LabCategory = 'scroll' | 'parallax' | 'canvas' | 'systems';

export type LabExperiment = {
  id: string;
  number: string;
  title: string;
  category: string;
  tag: LabCategory;
  badge: string;
  tools: readonly string[];
  summary: string;
  technique: string;
  params: string;
  code: string;
  cover: string;
  jpKey: keyof typeof JP;
  caseHref: string;
};

export const LAB_FILTERS: readonly { id: 'all' | LabCategory; label: string }[] = [
  { id: 'all', label: 'All work' },
  { id: 'scroll', label: 'Scroll & Pin' },
  { id: 'parallax', label: 'Parallax & Depth' },
  { id: 'canvas', label: 'Canvas & FX' },
  { id: 'systems', label: 'AI & Systems' },
];

export const LAB_EXPERIMENTS: readonly LabExperiment[] = [
  {
    id: 'scroll-frame-sequence',
    number: '01',
    title: '40-Frame Scroll Rig',
    category: 'ScrollTrigger · Frame scrub',
    tag: 'scroll',
    badge: 'Scroll',
    tools: ['GSAP', 'ScrollTrigger', 'Lenis'],
    summary: 'Pins the opening noir frame and scrubs through 40 pre-rendered WebP keyframes as the visitor scrolls, falling back to the nearest loaded frame.',
    technique: 'ScrollTrigger pin (+=150%) mapped linearly to frame index 1..40 with an inward breathing tween (0.994 scale) that never overflows the static shell.',
    params: 'pin: true · end: +=150% · scrub: true · ease: none',
    code: `ScrollTrigger.create({
  trigger: root,
  pin: true,
  start: 'top top',
  end: '+=150%',
  scrub: true,
  onUpdate: (self) => show(frameForProgress(self.progress)),
});`,
    cover: '/static/hero/image-4.webp',
    jpKey: 'nextEpisode',
    caseHref: '/#opening',
  },
  {
    id: 'dossier-parallax-rig',
    number: '02',
    title: 'Dossier 3-Plane Parallax',
    category: 'ScrollTrigger · Multi-depth',
    tag: 'parallax',
    badge: 'Parallax',
    tools: ['GSAP', 'ScrollTrigger', 'SVG'],
    summary: 'Separates kraft folder, typed report sheet, pinned evidence photo and stack tags across three vertical parallax speeds inside a single pinned scrub.',
    technique: 'Uses y offsets (40px / 80px / 120px) stacked cleanly on top of yPercent entrance cuts so GSAP composes both transforms without overwriting.',
    params: 'pin: true · end: +=150% · y: 40 / 80 / 120px · clipPath wipe',
    code: `tl.fromTo(sheet, { y: 40 }, { y: 0, duration: 1 }, 0)
  .fromTo(photo, { y: 80 }, { y: 0, duration: 1 }, 0)
  .fromTo([thread, tags], { y: 120 }, { y: 0, duration: 1 }, 0);`,
    cover: '/static/projects/criptenv.jpg',
    jpKey: 'folderOpen',
    caseHref: '/#case-criptenv',
  },
  {
    id: 'ink-cut-eyecatch',
    number: '03',
    title: 'Diagonal Ink Cut',
    category: 'Clip-path · Pinned beat',
    tag: 'scroll',
    badge: 'Scroll',
    tools: ['GSAP', 'CSS clip-path', 'ScrollTrigger'],
    summary: 'Full-bleed noir ink slash sweeps diagonally across the viewport before holding the episode title in place and slicing away to reveal the dossier.',
    technique: 'Polygonal clip-path coordinates interpolated across entry (top 75% → top) and a pinned 100% timeline with vertical title mask.',
    params: 'pin: true · end: +=100% · ease: power2.inOut · polygon clip-path',
    code: `gsap.fromTo(ink,
  { clipPath: 'polygon(0% 0%, 0% 0%, -15% 100%, -15% 100%)' },
  { clipPath: 'polygon(0% 0%, 115% 0%, 100% 100%, -15% 100%)',
    ease: 'power2.inOut',
    scrollTrigger: { trigger: root, start: 'top 75%', end: 'top top', scrub: true } }
);`,
    cover: '/static/opening/bg-1920.webp',
    jpKey: 'stampHit',
    caseHref: '/#cases',
  },
  {
    id: 'evidence-board-inertia',
    number: '04',
    title: 'Evidence Board Inertia',
    category: 'Pointer · Dual-layer depth',
    tag: 'parallax',
    badge: 'Parallax',
    tools: ['TypeScript', 'GSAP quickTo', 'ScrollTrigger'],
    summary: 'Two depth layers of pinned proof cards react both to vertical scroll parallax and free-form 2D pointer dragging with exponential friction decay.',
    technique: 'Combines ScrollTrigger y-translation between foreground (1.0×) and background (0.55×) cards with a pointer velocity accumulator damped at 0.935 per frame.',
    params: 'decay: 0.935^f · far scale: 0.65 · quickTo cursor: 0.35s power3.out',
    code: `if (!dragging) {
  offset.x += vel.x * f;
  offset.y += vel.y * f;
  const decay = Math.pow(0.935, f);
  vel.x *= decay;
  vel.y *= decay;
}`,
    cover: '/static/projects/range77.jpg',
    jpKey: 'solved',
    caseHref: '/77codelab/#board',
  },
  {
    id: 'noir-dust-rain-loop',
    number: '05',
    title: 'Beam Dust & Rain Canvas',
    category: 'Canvas 2D · IntersectionObserver',
    tag: 'canvas',
    badge: 'Canvas',
    tools: ['Canvas 2D', 'IntersectionObserver', 'matchMedia'],
    summary: 'Draws paper-toned dust motes drifting inside a diagonal window light beam and pauses automatically whenever the canvas leaves the screen.',
    technique: 'ResizeObserver scales DPR crispness while IntersectionObserver cancels requestAnimationFrame offscreen; completely skipped under reduced motion.',
    params: '60 motes · DPR clamped · paused offscreen via IO',
    code: `const io = new IntersectionObserver(([entry]) => {
  cancelAnimationFrame(raf);
  if (entry.isIntersecting) raf = requestAnimationFrame(loop);
});`,
    cover: '/static/projects/ateliesys.jpg',
    jpKey: 'rain',
    caseHref: '/#opening',
  },
  {
    id: 'hanko-stamp-spring',
    number: '06',
    title: 'Resolved Stamp Impact',
    category: 'Scroll threshold · Overshoot',
    tag: 'scroll',
    badge: 'Scroll',
    tools: ['GSAP', 'ScrollTrigger', 'CSS'],
    summary: 'Fires a physical rubber-stamp slam once the scrubbed dossier crosses 85% progress, landing at -11deg with crisp back-out overshoot.',
    technique: 'Monitors ScrollTrigger onUpdate threshold to toggle stamped state and trigger a one-shot 1.8 → 1.0 scale slam with back.out(2).',
    params: 'trigger: progress >= 0.85 · scale: 1.8 → 1 · duration: 0.35s · ease: back.out(2)',
    code: `if (stamped && !reduced) {
  gsap.fromTo(stampEl, { scale: 1.8 }, {
    scale: 1, duration: 0.35, ease: 'back.out(2)',
  });
}`,
    cover: '/static/projects/lenestudiobeauty.jpg',
    jpKey: 'stampHit',
    caseHref: '/#case-lene-studio-beauty',
  },
  {
    id: 'quickto-pointer-preview',
    number: '07',
    title: 'QuickTo Proof Preview',
    category: 'Pointer · Clip-path wipe',
    tag: 'parallax',
    badge: 'Motion',
    tools: ['GSAP quickTo', 'CSS clip-path'],
    summary: 'Row hover reveals a floating 4:5 evidence card masked from bottom to top while the cursor target interpolates smoothly without spawning new tweens.',
    technique: 'Two persistent gsap.quickTo setters track pointer coordinates (0.45s power3.out) paired with a sharp power2.inOut clip-path inset transition.',
    params: 'quickTo: 0.45s power3.out · wipe: inset(100% 0 0 0) → inset(0)',
    code: `const px = gsap.quickTo(preview, 'x', { duration: 0.45, ease: 'power3.out' });
const py = gsap.quickTo(preview, 'y', { duration: 0.45, ease: 'power3.out' });
list.addEventListener('pointermove', (e) => {
  px(e.clientX + 28);
  py(e.clientY - 120);
});`,
    cover: '/static/projects/criptenv-mobile.jpg',
    jpKey: 'folderOpen',
    caseHref: '/77codelab/#index',
  },
  {
    id: 'flora-ai-state-contract',
    number: '08',
    title: 'Flora AI State Contract',
    category: 'Edge Worker · Structured state',
    tag: 'systems',
    badge: 'System',
    tools: ['Cloudflare Workers', 'Turnstile', 'Claude API'],
    summary: 'Connects scroll-triggered studio arrival to a live Cloudflare Worker endpoint that returns both reply copy and character expression state.',
    technique: 'Pinned studio entrance transitions Flora from warm to happy before unlocking the form; POST /api/chat validates history bounds and rate limits.',
    params: 'POST /api/chat · rate limit: 10/min/IP · 8 expression states',
    code: `// Contract: POST /api/chat { messages, turnstileToken }
// Response: { reply: string, expression: FloraExpression }`,
    cover: '/static/projects/ateliesys-mobile.jpg',
    jpKey: 'partner',
    caseHref: '/#flora',
  },
];
