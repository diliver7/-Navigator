# -*- coding: utf-8 -*-
"""看板 v2 补丁：替换 board 区块 HTML，注入新的渲染逻辑（同名函数覆盖旧实现）。

用法：python scripts/patch_board.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"
miss = []


def splice(text, start, end, new, tag=""):
    i = text.find(start)
    if i < 0:
        miss.append((tag or start) + " [start 未找到]")
        return text
    j = text.find(end, i + len(start))
    if j < 0:
        miss.append((tag or start) + " [end 未找到]")
        return text
    return text[:i] + new + text[j:]


def main():
    html = HTML.read_text(encoding="utf-8")
    board_html = (ROOT / "scripts" / "board_block.html").read_text(encoding="utf-8")
    board_js = (ROOT / "scripts" / "board_block.js").read_text(encoding="utf-8")

    html = splice(html, '  <section id="board" data-route="board"', '  <!-- 训练路径 -->', board_html, "看板 HTML")

    if "学习看板 v2（覆盖旧的同名渲染函数）" in html:
        html = splice(
            html,
            "/* ================= 学习看板 v2（覆盖旧的同名渲染函数） ================= */",
            "/* ================= 初始化 ================= */",
            board_js + "\n",
            "看板 JS",
        )
    else:
        anchor = "/* ================= 初始化 ================= */"
        if anchor in html:
            html = html.replace(anchor, board_js + "\n" + anchor, 1)
        else:
            miss.append("看板 JS 插入点")

    HTML.write_text(html, encoding="utf-8")
    if miss:
        print("!! 未命中 %d 条：" % len(miss))
        for m in miss:
            print("   -", m)
    else:
        print("看板 v2 完成：今日概览 + 指标条 + 负荷图 + 任务筛选 + 双环 + 成就徽章")


if __name__ == "__main__":
    main()
