// Confere os arquivos estáticos: referência sem arquivo, arquivo sem uso, nome com espaço,
// peso de public/static e restos de texto do autor original. Uso: node scripts/check-assets.mjs
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REF = /\/static\/[^"'`)\s?]+/g;
const FRAMES = 40; // a hero monta `/static/frames2/Image${i}.webp` de 1 a 40
const LEFTOVER = /tenztan|tanmay|premee/i;

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]);
}

export function collectRefs(texts) {
  const refs = new Set();
  for (const text of texts) {
    for (const [ref] of text.matchAll(REF)) {
      if (ref.includes('${i}')) {
        for (let i = 1; i <= FRAMES; i++) refs.add(ref.replace('${i}', String(i)));
      } else {
        refs.add(ref);
      }
    }
  }
  return refs;
}

export function audit(root) {
  const sources = [join(root, 'index.html'), ...walk(join(root, 'src')).filter((f) => /\.(js|css)$/.test(f))];
  const texts = sources.map((f) => readFileSync(f, 'utf8'));
  const refs = collectRefs(texts);

  const publicDir = join(root, 'public');
  const staticFiles = walk(join(publicDir, 'static')).map((f) => '/' + relative(publicDir, f).split(sep).join('/'));

  const leftovers = sources.flatMap((f, n) => texts[n].split('\n')
    .map((line, i) => (LEFTOVER.test(line) ? `${relative(root, f)}:${i + 1}` : null))
    .filter(Boolean));

  return {
    missing: [...refs].filter((r) => !existsSync(join(publicDir, r))).sort(),
    unused: staticFiles.filter((f) => !refs.has(f)).sort(),
    spaced: walk(publicDir).filter((f) => relative(publicDir, f).includes(' ')).map((f) => relative(root, f)),
    bytes: walk(join(publicDir, 'static')).reduce((sum, f) => sum + statSync(f).size, 0),
    leftovers,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = audit(process.cwd());
  console.log(JSON.stringify(a, null, 2));
  const dirty = a.missing.length || a.unused.length || a.spaced.length || a.leftovers.length;
  process.exit(dirty ? 1 : 0);
}
