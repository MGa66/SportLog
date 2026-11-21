"""Schreibt die Piktogramme als pictos.js und die zugehörigen Styles in styles.css der App."""
import re, json, sys
sys.path.insert(0, '/home/claude/picto')
from picto import ICONS, CSS

APP = '/home/claude/sportlog'
pref = lambda m: f'class="p-{m.group(1)}"'
data = {k: re.sub(r'class="([\w-]+)"', pref, v) for k, (n, v) in ICONS.items()}
names = {k: n for k, (n, v) in ICONS.items()}

js = ('/* SportLog – Piktogramme der Übungen (64×64, erzeugt aus picto.py).\n'
      '   Körper hell, bewegtes Gewicht und Griffe orange, Geräte grau. */\n'
      f'const PICTOS = {json.dumps(data, ensure_ascii=False, indent=0)};\n'
      f'const PICTO_NAMES = {json.dumps(names, ensure_ascii=False, indent=0)};\n')
open(f'{APP}/pictos.js', 'w').write(js)

css = re.sub(r'\.([a-z][\w-]*)(?=[\s,{.:])', lambda m: f'.px .p-{m.group(1)}', CSS)
css = css.replace('var(--body)', 'var(--tx)')
block = ('/* >>> Piktogramme (erzeugt) */\n'
         '.px { --eq: #68717f; display: block; width: 100%; height: 100%; overflow: visible; }\n'
         + css.strip() + '\n/* <<< Piktogramme */\n')
st = open(f'{APP}/styles.css').read()
st = re.sub(r'/\* >>> Piktogramme \(erzeugt\) \*/.*?/\* <<< Piktogramme \*/\n', '', st, flags=re.S)
open(f'{APP}/styles.css', 'w').write(st.rstrip() + '\n\n' + block)
print(len(data), 'Piktogramme,', len(js), 'Bytes JS')
