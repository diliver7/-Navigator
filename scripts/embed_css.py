# -*- coding: utf-8 -*-
"""
把 scripts/.tw-build.css 重新灌进 index.html 的内嵌样式行。

静态版不依赖 CDN，Tailwind 产物直接内嵌在 index.html 第 9 行。
每当改动页面里的 Tailwind 类名（例如新增 xl:grid-cols-3、grid-cols-7、h-24），
都要先编译再灌入，否则新类没有对应样式。

用法：
  npx --no-install tailwindcss -c scripts/tailwind.static.cjs -i scripts/tailwind.input.css -o scripts/.tw-build.css --minify
  python scripts/embed_css.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
CSS = ROOT / "scripts" / ".tw-build.css"

MARK = "/* Tailwind 编译版（内嵌，离线可用；配置见 scripts/tailwind.static.cjs） */"


def main():
    css = CSS.read_text(encoding="utf-8").strip()
    if "\n" in css:
        raise SystemExit("编译产物不是单行，请确认用了 --minify")
    html = HTML.read_text(encoding="utf-8")
    lines = html.split("\n")
    try:
        i = lines.index(MARK)
    except ValueError:
        raise SystemExit("index.html 中未找到 Tailwind 注释标记")
    if i + 1 >= len(lines):
        raise SystemExit("注释标记后没有样式行")
    old_len = len(lines[i + 1])
    lines[i + 1] = css
    HTML.write_text("\n".join(lines), encoding="utf-8")
    print(f"已灌入内嵌样式：{old_len} → {len(css)} 字符")


if __name__ == "__main__":
    main()
