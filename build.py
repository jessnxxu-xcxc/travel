#!/usr/bin/env python3
"""改完 app.css / trip.js / app.js / themes.js 之後跑這支，網址上的版本號會自動更新。

為什麼需要：手機會把這些檔案存起來（才能開得快、沒網路也能看）。
版本號一變，手機就知道要抓新的；沒更新的話大家會一直看到舊版。
.githooks/pre-commit 已經會自動跑它，平常不用管。
"""
import hashlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent
ASSETS = ['app.css', 'themes.js', 'trip.js', 'app.js']


def h8(p):
    return hashlib.sha1(p.read_bytes()).hexdigest()[:8]


def main():
    missing = [a for a in ASSETS if not (ROOT / a).exists()]
    if missing:
        sys.exit('找不到這些檔案：' + ', '.join(missing))

    ver = {a: h8(ROOT / a) for a in ASSETS}
    changed = []

    for name in ('index.html', 'sw.js'):
        p = ROOT / name
        src = p.read_text(encoding='utf-8')
        out = src
        for a, v in ver.items():
            out = re.sub(r'(' + re.escape(a) + r'\?v=)[^\'")&\s]*', r'\g<1>' + v, out)
        if name == 'sw.js':
            allv = hashlib.sha1(''.join(ver[a] for a in ASSETS).encode()).hexdigest()[:8]
            out = re.sub(r"(const V = ')[^']*(')", r'\g<1>tn-' + allv + r'\g<2>', out)
        if out != src:
            p.write_text(out, encoding='utf-8')
            changed.append(name)

    for a in ASSETS:
        print(f'  {a:<12} {ver[a]}')
    print('已更新：' + (', '.join(changed) if changed else '（版本號本來就是最新的）'))


if __name__ == '__main__':
    main()
