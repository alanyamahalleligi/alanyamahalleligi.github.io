"""src/ altındaki parçaları index.html (ve GitHub Pages yönlendirmesi için 404.html) olarak birleştirir,
betiklerin sözdizimini denetler. Kullanım: python src/build.py"""
import json, os, glob
S = os.path.dirname(os.path.abspath(__file__))
R = lambda n: open(os.path.join(S, n), encoding='utf-8').read()
parts = sorted(glob.glob(os.path.join(S, 'js', '*.js')))
app = ''.join(open(p, encoding='utf-8').read() + '\n' for p in parts)
mod = R('module.js')
out = R('head.html') + R('body.html') + '\n<script>\n' + app + '</script>\n<script type="module">\n' + mod + R('tail.html')
for name in ('index.html', '404.html'):
    open(os.path.join(S, '..', name), 'w', encoding='utf-8').write(out)
try:
    import quickjs
    c = quickjs.Context()
    for name, src in [('app (' + ', '.join(os.path.basename(p) for p in parts) + ')', app), ('module.js', '(async()=>{' + mod + '})')]:
        try:
            c.eval('new Function(' + json.dumps(src) + ')'); print(name, 'OK')
        except Exception as e:
            print(name, 'HATA', e)
except ImportError:
    print('quickjs yok, sözdizimi denetlenmedi')
print('index.html', len(out), 'bayt')
