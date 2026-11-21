"""Baut aus index.html, styles.css und app.js eine einzelne Vorschau-Datei (für das Claude-Artefakt)."""
import re, sys, pathlib
root = pathlib.Path(__file__).parent
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else root / 'SportLog-Vorschau.html')
html = (root / 'index.html').read_text()
css = (root / 'styles.css').read_text()
js = (root / 'pictos.js').read_text() + '\n' + (root / 'app.js').read_text()
assert '</script' not in js.lower()
body = re.search(r'<body>(.*?)<script src="pictos.js"></script>', html, re.S).group(1)
out.write_text(f'''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0d0f12">
<title>SportLog</title>
<style>
{css}
</style>
</head>
<body>
{body.strip()}
<script>window.SPORTLOG_PREVIEW = true;</script>
<script>
{js}
</script>
</body>
</html>
''')
print(out, out.stat().st_size, 'bytes')
