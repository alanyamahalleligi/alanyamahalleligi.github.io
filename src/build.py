"""src/ altındaki parçaları index.html olarak birleştirir ve betiklerin sözdizimini denetler.
Kullanım: python src/build.py"""
import json, os
S = os.path.dirname(os.path.abspath(__file__))
R = lambda n: open(os.path.join(S, n), encoding='utf-8').read()
app, mod = R('app.js'), R('module.js')
out = R('head.html') + R('body.html') + '\n<script>\n' + app + '</script>\n<script type="module">\n' + mod + R('tail.html')
open(os.path.join(S, '..', 'index.html'), 'w', encoding='utf-8').write(out)
try:
    import quickjs
    c = quickjs.Context()
    for name, src in [('app.js', app), ('module.js', '(async()=>{' + mod + '})')]:
        try:
            c.eval('new Function(' + json.dumps(src) + ')'); print(name, 'OK')
        except Exception as e:
            print(name, 'HATA', e)
except ImportError:
    print('quickjs yok, sözdizimi denetlenmedi')
print('index.html', len(out), 'bayt')
