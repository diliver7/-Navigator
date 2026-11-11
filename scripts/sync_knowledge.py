# -*- coding: utf-8 -*-
"""
引航 Navigator · 学习方法笔记的单一数据源与同步脚本

资料内容维护在 scripts/learning_notes.py（26 篇 / 7 类）+ scripts/learning_notes_extra.py
（16 篇扩充包 / 新增元认知与动机、数字工具与 AI 两类）
+ scripts/learning_notes_extra2.py（16 篇证据争议、生理情绪、协作输出、数字素养），
合并后 58 篇 / 9 类。
运行本脚本会同步到：
  1. data/knowledge-catalog.json（结构化目录）
  2. data/knowledge/*.md（人类可读笔记，同时是 Next.js 版 RAG 的种子文档）
  3. index.html 的 KNOWLEDGE_DOCS 常量（保持单文件、断网可用）

资料来源：公开权威论文、专著与大学学习指导中心材料（详见每篇 source 字段），
内容为中文归纳改写，仅用于本地离线检索与学习，不替代原始文献。

运行：python scripts/sync_knowledge.py
"""

import json
from pathlib import Path

from learning_notes import NOTES as DOCS

ROOT = Path(__file__).resolve().parents[1]


def build_js_array(docs):
    """把文档列表序列化为可直接嵌入 <script> 的 JS 字面量。"""
    return json.dumps(docs, ensure_ascii=False, indent=1)


def sync_index_html(js_array, count):
    path = ROOT / "index.html"
    html = path.read_text(encoding="utf-8")
    start_marker = "const KNOWLEDGE_DOCS = ["
    end_marker = "/* ================= 工具函数 ================= */"
    start = html.find(start_marker)
    end = html.find(end_marker, start)
    if start < 0 or end < 0:
        raise SystemExit("index.html 中未找到 KNOWLEDGE_DOCS 标记，停止同步")
    replacement = "const KNOWLEDGE_DOCS = " + js_array + ";\n\n"
    html = html[:start] + replacement + html[end:]
    path.write_text(html, encoding="utf-8")
    print(f"  index.html  <- {count} 篇笔记（内嵌）")


def sync_catalog(docs):
    out = ROOT / "data" / "knowledge-catalog.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "version": "5.0",
        "updated": "2026-11-11",
        "description": "引航 Navigator 学习方法笔记：单一数据源，由 scripts/sync_knowledge.py 生成",
        "categories": [],
        "docs": docs,
    }
    payload["categories"] = list(dict.fromkeys(d["category"] for d in docs))
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  data/knowledge-catalog.json  <- {len(docs)} 篇 / {len(payload['categories'])} 个分类")


def sync_markdown(docs):
    folder = ROOT / "data" / "knowledge"
    folder.mkdir(parents=True, exist_ok=True)
    for old in folder.glob("*.md"):
        old.unlink()
    for d in docs:
        lines = [
            f"# {d['title']}", "",
            f"- 分类：{d['category']}",
            f"- 标签：{' / '.join(d['tags'])}",
            f"- 来源：{'；'.join(d['source'])}", "",
            "---", "", d["content"], "",
            "## 参考来源", "",
        ]
        lines += [f"- {s}" for s in d["source"]]
        (folder / f"{d['id']}.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"  data/knowledge/*.md  <- {len(docs)} 个 Markdown 文件（Next.js 版自动读取）")


if __name__ == "__main__":
    total_chars = sum(len(d["content"]) for d in DOCS)
    print(f"学习方法笔记：{len(DOCS)} 篇 / {total_chars:,} 字 / {len(set(d['category'] for d in DOCS))} 个分类")
    sync_catalog(DOCS)
    sync_markdown(DOCS)
    sync_index_html(build_js_array(DOCS), len(DOCS))
    print("同步完成。")
