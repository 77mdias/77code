"""Gera public/fonts/ReggaeOne-JP.woff2 só com os caracteres de src/content/jp.ts.

Uso: python3 -I scripts/make-jp-font.py  (fonttools e brotli num venv; a fonte de origem é o devDependency @fontsource/reggae-one, que não vai para o bundle)
Depois de mexer em jp.ts, rode de novo e faça commit do .woff2. A OFL do Reggae One permite o subconjunto
e não declara nome reservado, por isso a família continua 'Reggae One'.
"""
import re
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'node_modules/@fontsource/reggae-one/files/reggae-one-japanese-400-normal.woff2'
OUT = ROOT / 'public/fonts/ReggaeOne-JP.woff2'

text = ''.join(re.findall(r"text: '([^']*)'", (ROOT / 'src/content/jp.ts').read_text(encoding='utf8')))
chars = ''.join(sorted(set(text + '・…0123456789')))

opts = subset.Options()
opts.flavor = 'woff2'
opts.layout_features = ['*']
opts.notdef_outline = True
font = subset.load_font(str(SRC), opts)
sub = subset.Subsetter(opts)
sub.populate(text=chars)
sub.subset(font)
missing = [c for c in chars if ord(c) not in font.getBestCmap()]
assert not missing, f'sem glifo na fonte de origem: {missing}'
subset.save_font(font, str(OUT), opts)
print(f'{OUT.name}: {OUT.stat().st_size} bytes, {len(chars)} caracteres: {chars}')
