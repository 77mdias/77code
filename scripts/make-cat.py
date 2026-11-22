"""Converte design/Loader cat.json (Lottie) em src/ui/LoaderCat.tsx: SVG com animação SMIL,
nas cores do DESIGN_V1.md (gato de nanquim sobre uma lua de papel). Sem biblioteca de Lottie no site.

    python3 -I scripts/make-cat.py
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'design' / 'Loader cat.json'
OUT = ROOT / 'src' / 'ui' / 'LoaderCat.tsx'

SHADOW = 'color-mix(in srgb, var(--ink) 16%, transparent)'
# Camada do Lottie -> cor nossa. O original é um gato azul-escuro em fundo claro.
COLORS = {
    'Museau Outlines': 'var(--red)',
    'Collier Blanc Outlines': 'var(--paper)',
    'Ventre Blanc Outlines': 'var(--paper-shade)',
    'Patte Droite Outlines': 'var(--desk)',
    'Corps Outlines': 'var(--desk)',
    'Arrière Train Outlines': 'var(--ink)',
    'Oreillle Droite Outlines': 'var(--ink)',
    'Oreille Gauche Outlines': 'var(--ink)',
    'Queue': 'var(--desk)',
    'Queue Ombre': SHADOW,
    'Ombre': SHADOW,
}


def n(x):
    return f'{x:.2f}'.rstrip('0').rstrip('.')


def path(shape):
    v, i, o = shape['v'], shape['i'], shape['o']
    d = [f'M{n(v[0][0])} {n(v[0][1])}']
    last = len(v) if shape['c'] else len(v) - 1
    for k in range(last):
        a, b = k, (k + 1) % len(v)
        d.append(f'C{n(v[a][0] + o[a][0])} {n(v[a][1] + o[a][1])} {n(v[b][0] + i[b][0])} {n(v[b][1] + i[b][1])} {n(v[b][0])} {n(v[b][1])}')
    return ''.join(d) + ('Z' if shape['c'] else '')


def scalar(x):
    return x[0] if isinstance(x, list) else x


def timing(keys, total):
    """Tempos (0..1) e curvas de um conjunto de quadros-chave do Lottie, com espera até o fim do laço."""
    times = [0.0] + [k['t'] / total for k in keys if k['t'] > 0] + [1.0]
    splines = ['0 0 1 1'] if keys[0]['t'] > 0 else []
    for k in keys[:-1]:
        splines.append(f"{n(scalar(k['o']['x']))} {n(scalar(k['o']['y']))} {n(scalar(k['i']['x']))} {n(scalar(k['i']['y']))}")
    splines.append('0 0 1 1')
    return ';'.join(n(t) if t in (0.0, 1.0) else f'{t:.4f}' for t in times), ';'.join(splines)


def main():
    lottie = json.loads(SRC.read_text())
    total = lottie['op'] - lottie['ip']
    dur = f"{n(total / lottie['fr'])}s"
    consts, body = [], []

    for layer in reversed(lottie['layers']):  # no Lottie a 1ª camada é a de cima
        name, ks = layer['nm'], layer['ks']
        color = COLORS[name]
        px, py = ks['p']['k'][:2]
        ax, ay = ks['a']['k'][:2]
        sx, sy = (c / 100 for c in ks['s']['k'][:2])
        if 'rx' in ks:  # camada 3D (sombra do rabo deitada no chão): achata na altura
            sy *= math.cos(math.radians(ks['rx']['k']))
        items = {it['ty']: it for it in layer['shapes'][0]['it']}
        gx, gy = items['tr']['p']['k']
        # Só o que não é identidade entra no transform.
        parts = ([f'scale({n(sx)} {n(sy)})'] if (n(sx), n(sy)) != ('1', '1') else []) + \
            ([f'translate({n(gx - ax)} {n(gy - ay)})'] if abs(gx - ax) > 0.005 or abs(gy - ay) > 0.005 else [])
        inner = ' '.join(parts)

        if 'el' in items:
            w, h = items['el']['s']['k']
            shape = f'<ellipse rx="{n(w / 2)}" ry="{n(h / 2)}" style={{{{ fill: \'{color}\' }}}} />'
        else:
            sh = items['sh']['ks']
            if 'st' in items:
                paint = f"style={{{{ fill: 'none', stroke: '{color}' }}}} strokeWidth=\"{n(items['st']['w']['k'])}\" strokeLinecap=\"round\""
            else:
                paint = f"style={{{{ fill: '{color}' }}}}"
            if sh['a']:
                keys = sh['k']
                shapes = [path(k['s'][0]) for k in keys[:-1]] + [path(keys[-2]['e'][0])] * 2
                key_times, key_splines = timing(keys, total)
                if 'TAIL' not in ''.join(consts):
                    consts.append(f"const TAIL = '{';'.join(shapes)}';")
                    consts.append(f"const TAIL_TIMES = '{key_times}';")
                    consts.append(f"const TAIL_EASE = '{key_splines}';")
                shape = (f'<path d="{shapes[0]}" {paint}>\n'
                         f'          {{!still && <animate attributeName="d" dur={{DUR}} repeatCount="indefinite" calcMode="spline" '
                         f'values={{TAIL}} keyTimes={{TAIL_TIMES}} keySplines={{TAIL_EASE}} />}}\n        </path>')
            else:
                shape = f'<path d="{path(sh["k"])}" {paint} />'

        rot = ks.get('r')
        spin = ''
        if rot and rot['a']:
            keys = rot['k']
            values = ([n(keys[0]['s'][0])] if keys[0]['t'] > 0 else []) + [n(k['s'][0]) for k in keys[:-1]] + [n(keys[-2]['e'][0])] * 2
            key_times, key_splines = timing(keys, total)
            spin = (f'\n          {{!still && <animateTransform attributeName="transform" type="rotate" dur={{DUR}} repeatCount="indefinite" '
                    f'calcMode="spline" values="{";".join(values)}" keyTimes="{key_times}" keySplines="{key_splines}" />}}')
        body.append(f'      {{/* {name} */}}\n      <g transform="translate({n(px)} {n(py)})">\n        <g>{spin}\n'
                    + (f'        <g transform="{inner}">{shape}</g>\n' if inner else f'        {shape}\n') + '        </g>\n      </g>')

    OUT.write_text(f"""// Gerado por scripts/make-cat.py a partir de design/Loader cat.json. Não editar à mão: rodar o script.
import {{ useReducedMotion }} from '../lib/motion.ts';

const DUR = '{dur}';
{chr(10).join(consts)}

// Gato de nanquim sentado numa lua de papel, abanando o rabo. Decorativo; parado com menos movimento.
export function LoaderCat({{ className }}: {{ className?: string }}) {{
  const still = useReducedMotion();
  return (
    <svg className={{className}} viewBox="0 0 {lottie['w']} {lottie['h']}" aria-hidden="true">
      <circle cx="158" cy="104" r="100" style={{{{ fill: 'var(--paper)' }}}} />
{chr(10).join(body)}
    </svg>
  );
}}
""")
    print(f'{OUT.relative_to(ROOT)}: {OUT.stat().st_size} bytes, laço de {dur}')


main()
