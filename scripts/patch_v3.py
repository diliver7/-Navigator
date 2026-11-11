# -*- coding: utf-8 -*-
"""v3 增量补丁：修复 CTA 响应 + 新增 AI 问答台 + 看板美化。

与 patch_merge_a/b.py 不同，这个脚本只做「增量新增」，复跑安全（幂等）。
用法：python scripts/patch_v3.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "index.html"
miss = []


def repl(text, old, new, tag=""):
    # 先判断新内容是否已存在：避免 old 是 new 子串时每次复跑都重复追加
    if new and new in text:
        return text
    if old in text:
        return text.replace(old, new)
    miss.append(tag or old[:60].replace("\n", "\\n"))
    return text


def splice(text, start, end, new, tag=""):
    """用 start/end 标记替换中间内容；若 new 已完整存在则跳过。"""
    if new and new in text:
        return text
    i = text.find(start)
    if i < 0:
        miss.append((tag or start) + " [start 未找到]")
        return text
    j = text.find(end, i + len(start))
    if j < 0:
        miss.append((tag or start) + " [end 未找到]")
        return text
    return text[:i] + new + text[j:]


# ============================================================ A. CTA 响应
START_GUIDE = r'''
/* 导览入口：合并导航后 #/guide 已归入 #/try，按钮必须滚动定位而不是原地刷新 */
window.startGuide = function (autoplay) {
  const jump = () => {
    const sec = document.getElementById("guide");
    if (sec) {
      const y = Math.max(0, sec.getBoundingClientRect().top + window.scrollY - 68);
      const from = window.scrollY;
      window.scrollTo({ top: y, behavior: "smooth" });
      // 兜底：个别环境不推进平滑滚动时直接定位
      setTimeout(() => {
        if (Math.abs(window.scrollY - from) < 8 && Math.abs(window.scrollY - y) > 8) window.scrollTo(0, y);
      }, 420);
    }
    guideGo(0);
    if (autoplay && !guideTimer) guideToggle();
  };
  if (window.__route !== "try") {
    location.hash = "#/try";
    setTimeout(jump, 90);
  } else {
    jump();
  }
};
'''


def patch_cta(html):
    html = repl(
        html,
        """<button onclick="gotoRoute('guide')" class="btn-primary">""",
        """<button onclick="startGuide(1)" class="btn-primary">""",
        "hero CTA 1",
    )
    html = repl(
        html,
        """<a href="#/guide" class="btn-ghost">让小引带你看一遍</a>""",
        """<button onclick="startGuide(0)" class="btn-ghost">让小引带你看一遍</button>""",
        "hero CTA 2",
    )
    # startGuide 注入到 guideToggle 之后
    if "window.startGuide = function" not in html:
        anchor = "function guideToggle() {"
        i = html.find(anchor)
        if i >= 0:
            # 找到 guideToggle 函数结束（下一个顶层 function 声明前）
            j = html.find("\nlet typeTimer", i)
            if j < 0:
                j = html.find("\nfunction typeText", i)
            if j > i:
                html = html[:j] + "\n" + START_GUIDE + html[j:]
            else:
                miss.append("startGuide 注入点")
        else:
            miss.append("guideToggle 未找到")
    # 旧深链 #/guide 落到导览台
    html = repl(
        html,
        """    if (raw !== r) history.replaceState(null, "", "#/" + r);
    routeFX(r);""",
        """    if (raw !== r) history.replaceState(null, "", "#/" + r);
    routeFX(r);
    if (raw === "guide") setTimeout(() => { const s = document.getElementById("guide"); if (s) s.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80);""",
        "hashchange guide 锚点",
    )
    html = repl(
        html,
        """  routeFX(ROUTES.includes(first) ? first : "try");""",
        """  routeFX(ROUTES.includes(first) ? first : "try");
  if (firstRaw === "guide") setTimeout(() => { const s = document.getElementById("guide"); if (s) s.scrollIntoView({ behavior: "smooth", block: "start" }); }, 120);""",
        "首次加载 guide 锚点",
    )
    return html


def main():
    html = HTML.read_text(encoding="utf-8")
    html = patch_cta(html)
    html = patch_ask(html)
    HTML.write_text(html, encoding="utf-8")
    if miss:
        print("!! 未命中 %d 条：" % len(miss))
        for m in miss:
            print("   -", m)
    else:
        print("补丁 v3 完成：CTA 滚动定位 + startGuide + AI 问答台")




# ============================================================ B. AI 问答台
def patch_ask(html):
    ask_html = (ROOT / "scripts" / "ask_block.html").read_text(encoding="utf-8")
    ask_js = (ROOT / "scripts" / "ask_block.js").read_text(encoding="utf-8")

    if 'id="ask-thread"' in html:
        html = splice(html, "  <!-- AI 问答台 -->", "  <!-- 导游台 -->", ask_html, "AI 问答台 HTML")
    else:
        html = splice(html, "  <!-- 导游台 -->", "  <section id=\"guide\"", ask_html + "  <!-- 导游台 -->\n", "AI 问答台 HTML 新增")
    board_marker = "/* ================= 学习看板 v2（覆盖旧的同名渲染函数） ================= */"
    end_marker = board_marker if board_marker in html else "/* ================= 初始化 ================= */"
    if "AI 问答台（问答台 · ASK）" in html:
        html = splice(html, "/* ================= AI 问答台（问答台 · ASK） ================= */",
                      end_marker, ask_js + "\n", "AI 问答台 JS")
    else:
        html = splice(html, "/* ================= 初始化 ================= */", "renderHome();",
                      ask_js + "\n/* ================= 初始化 ================= */\n", "AI 问答台 JS 新增")
    return html

if __name__ == "__main__":
    main()
