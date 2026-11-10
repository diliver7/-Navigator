# -*- coding: utf-8 -*-
"""
把 index.html 的「内容」从 AI Agent 技术站整体替换为学习方法工具站。

严格约束：只替换文案字符串与数据常量，不改动 HTML 结构、CSS、路由、
函数签名、检索引擎、工具注册表逻辑与工作台交互。每条替换都会校验命中。

运行：python scripts/apply_learning_copy.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "index.html"

# (旧文案, 新文案) —— 全部使用 raw 字符串，保留 JS 里的反斜杠字面量
REPL = [
    # ---------- head / 开场 / 导航 ----------
    (r"""<title>引航 Navigator · AI Agent 学习与办公任务助手</title>""",
     r"""<title>引航 Navigator · 学习方法与效率工具站</title>"""),
    (r"""      <span>现场试</span><span>导游台</span><span>能力矩阵</span><span>知识库</span><span>效率看板</span><span>学习路径</span><span>本地 API</span>""",
     r"""      <span>试一试</span><span>新手导览</span><span>方法矩阵</span><span>检索实验室</span><span>学习看板</span><span>训练路径</span><span>可选增强</span>"""),
    (r"""        <span class="block text-[10px] text-slate-500">AI Agent 学习/办公助手</span>""",
     r"""        <span class="block text-[10px] text-slate-500">学习方法与效率工具站</span>"""),
    (r""">现场试</a>""", r""">试一试</a>"""),
    (r""">导游台</a>""", r""">新手导览</a>"""),
    (r""">能力矩阵</a>""", r""">方法矩阵</a>"""),
    (r""">知识库</a>""", r""">检索实验室</a>"""),
    (r""">效率看板</a>""", r""">学习看板</a>"""),
    (r""">学习路径</a>""", r""">训练路径</a>"""),
    (r""">本地 API</a>""", r""">可选增强</a>"""),
    (r"""<span class="hidden sm:inline">本地 API 设置</span>""",
     r"""<span class="hidden sm:inline">配置可选增强</span>"""),

    # ---------- Hero ----------
    (r"""      <span class="chip mb-5"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-mint"></span>零配置可用 · 26 篇资料内置 · Agent / RAG / 多模态</span>""",
     r"""      <span class="chip mb-5"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-mint"></span>零配置可用 · 26 篇方法笔记内置 · 记忆 / 专注 / 计划 / 应试</span>"""),
    (r"""        不是聊天框，<br />而是<span class="bg-gradient-to-r from-brand-soft via-brand to-mint bg-clip-text text-transparent">会动手做事</span>的学习办公搭子""",
     r"""        不是收藏夹，<br />而是<span class="bg-gradient-to-r from-brand-soft via-brand to-mint bg-clip-text text-transparent">陪你练会</span>的<br />学习方法工具站"""),
    (r"""          立即开始任务""", r"""          看看怎么练"""),
    (r"""        <span>不用注册、不用填 Key：打开就能问答、规划、建待办、看引用。配置自己的 Key 后，同一批资料会交给大模型深度组织，答案更精准更充分。</span>""",
     r"""        <span>不用注册、不用填 Key：打开就能查方法、排复习计划、建学习任务、看原文出处。配置自己的 Key 后，同一批笔记会交给大模型深度组织，解读更贴合你的情况。</span>"""),
    (r"""<b class="block text-lg text-white" id="stat-doc">26</b>篇内置资料""",
     r"""<b class="block text-lg text-white" id="stat-doc">26</b>篇方法笔记"""),
    (r"""<b class="block text-lg text-white">8</b>个可调工具""",
     r"""<b class="block text-lg text-white">8</b>个学习工具"""),
    (r"""  <!-- Hero 动画：Agent 运行核心 -->""", r"""  <!-- Hero 动画：学习闭环 -->"""),
    (r"""运行示意 · 真机见下方「现场试一句」""", r"""运行示意 · 真机见下方「试一句」"""),
    (r"""<p class="text-[10px] uppercase tracking-[0.2em] text-white/70">AGENT</p>""",
     r"""<p class="text-[10px] uppercase tracking-[0.2em] text-white/70">STUDY</p>"""),
    (r"""<p class="mt-1 text-xs font-semibold text-white" id="hero-step-label">规划任务</p>""",
     r"""<p class="mt-1 text-xs font-semibold text-white" id="hero-step-label">主动回忆</p>"""),
    (r""">search_knowledge</span>""", r""">主动回忆</span>"""),
    (r""">add_todo ✓</span>""", r""">复习计划 ✓</span>"""),
    (r""">calculate</span>""", r""">番茄钟</span>"""),
    (r"""<p class="text-[10px] uppercase tracking-widest text-mint">RAG 检索</p>""",
     r"""<p class="text-[10px] uppercase tracking-widest text-mint">笔记检索</p>"""),
    (r"""<p class="mt-1.5 text-[11px] text-slate-300">新增待办「复习 RAG」</p>""",
     r"""<p class="mt-1.5 text-[11px] text-slate-300">新增任务「今晚自测错题」</p>"""),
    (r"""      <span>Plan 规划</span><span>·</span><span>Function Calling</span><span>·</span><span>RAG TF-IDF</span><span>·</span><span>Human-in-the-loop</span><span>·</span><span>SSE 流式</span><span>·</span><span>Web Speech 语音</span><span>·</span><span>MCP 工具清单</span><span>·</span><span>密钥本地保存</span><span>·</span>""",
     r"""      <span>主动回忆</span><span>·</span><span>间隔重复</span><span>·</span><span>交错练习</span><span>·</span><span>费曼技巧</span><span>·</span><span>番茄工作法</span><span>·</span><span>康奈尔笔记</span><span>·</span><span>错题归因</span><span>·</span><span>周回顾</span><span>·</span>"""),

    # ---------- 体验区 ----------
    (r"""          <span class="text-[11px] text-slate-500">离线：本地规则引擎 + 26 篇资料实时检索 · 配置 Key 后叠加大模型深度规划</span>""",
     r"""          <span class="text-[11px] text-slate-500">离线：26 篇方法笔记实时检索 + 本地规划引擎 · 配置 Key 后可生成更贴合你的个性化复习计划</span>"""),
    (r"""placeholder="输入一个真实目标，例如：帮我安排明晚的 RAG 复习计划" """.rstrip(),
     r"""placeholder="输入一个学习目标，例如：帮我安排考前三周的复习计划" """.rstrip()),
    (r"""            跑一遍规划""", r"""            生成学习计划"""),

    # ---------- 导游台 ----------
    (r"""      <span class="chip"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-mint"></span>GUIDE CONSOLE · 全程陪伴</span>""",
     r"""      <span class="chip"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-mint"></span>GUIDE CONSOLE · 六步上手</span>"""),
    (r"""        不是聊天框，<br class="sm:hidden" />而是<span class="bg-gradient-to-r from-brand-soft via-brand to-mint bg-clip-text text-transparent">会动手做事</span>的学习办公搭子""",
     r"""        不是又一份书单，<br class="sm:hidden" />而是<span class="bg-gradient-to-r from-brand-soft via-brand to-mint bg-clip-text text-transparent">带你练会</span>的学习方法工具站"""),
    (r"""      <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-400">引航先为你的目标做规划，再调用本地知识库、待办、笔记与计算工具，写操作前请求你确认，最后以流式方式给出带引用的答复。</p>""",
     r"""      <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-400">引航先帮你把学习目标拆成阶段，再从 26 篇笔记里检索依据、排复习任务与自测卡片，写入前请你确认，最后给出可核对原文出处的答复。</p>"""),
    (r"""              <p class="mt-1 text-xs leading-5 text-slate-400">引航的 AI 导游。第一次来？<br />我带你走完整个工作流。</p>""",
     r"""              <p class="mt-1 text-xs leading-5 text-slate-400">引航的学习导游。第一次来？<br />我带你把这套方法走一遍。</p>"""),

    # ---------- 方法矩阵 / 检索实验室 ----------
    (r"""    <span class="chip reveal">CAPABILITY MATRIX</span>""",
     r"""    <span class="chip reveal">LEARNING TOOLKIT</span>"""),
    (r"""<h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">六项 AI 能力，全部真实可验证</h2>""",
     r"""<h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">六件学习工具，每一件都能立刻上手</h2>"""),
    (r"""    <p class="reveal mt-2 max-w-2xl text-sm text-slate-400">不是展示用摆设——每一项都能在工作台里亲手触发。</p>""",
     r"""    <p class="reveal mt-2 max-w-2xl text-sm text-slate-400">不是概念展示——每一项都能在工作台里亲手跑一遍，并把结果存进你的学习看板。</p>"""),
    (r"""    <span class="chip reveal">KNOWLEDGE LAB · 本地 RAG</span>""",
     r"""    <span class="chip reveal">RETRIEVAL LAB · 本地笔记检索</span>"""),
    (r"""<h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">亲手试一下检索引擎</h2>""",
     r"""<h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">亲手试一下笔记检索</h2>"""),
    (r"""    <p class="reveal mt-2 max-w-2xl text-sm text-slate-400">26 篇 / 7 类 / 约 2.5 万字资料已在浏览器内完成分块与 TF-IDF 向量化。输入任意问题，实时查看命中片段与相似度——这就是工作台里 Agent 调用的同一个引擎，完全离线。</p>""",
     r"""    <p class="reveal mt-2 max-w-2xl text-sm text-slate-400">26 篇 / 7 类 / 约 3 万字学习方法笔记已在浏览器内完成分块与 TF-IDF 向量化。输入任意学习问题，实时查看命中片段与相似度——工作台里的带出处答复就来自这个引擎，完全离线。</p>"""),
    (r"""          内置文档""", r"""          内置笔记"""),

    # ---------- 资料中心 ----------
    (r"""<h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">26 篇资料，全部装在这一页里</h2>""",
     r"""<h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">26 篇方法笔记，全部装在这一页里</h2>"""),
    (r"""    <p class="reveal mt-2 max-w-3xl text-sm text-slate-400">内容取自公开权威文档、论文与官方规范，经中文归纳改写并标注来源。它们既是离线问答的知识底座，也是配置 Key 后注入大模型的上下文——不需要联网抓取，也不需要任何账号。</p>""",
     r"""    <p class="reveal mt-2 max-w-3xl text-sm text-slate-400">内容取自学习科学论文、专著与大学学习指导中心材料，按「核心概念 / 关键结论 / 操作步骤 / 易错点 / 自测题」写成可直接复习的笔记，并标注来源。它们既是离线问答的依据，也是配置 Key 后注入大模型的上下文。</p>"""),
    (r"""        <h3 class="mt-3 text-[16px] font-semibold text-white">打开就能用的完整闭环</h3>""",
     r"""        <h3 class="mt-3 text-[16px] font-semibold text-white">打开就能用的学习闭环</h3>"""),
    (r"""          <li>✓ 26 篇资料的本地检索 + 抽取式问答，带 [编号] 引用与原文核对</li>
          <li>✓ 意图感知的任务规划、8 个本地工具、写操作人工审批</li>
          <li>✓ 待办 / 笔记 / 长期记忆 / 效率看板 / 安全计算器</li>
          <li>✓ 语音输入与朗读、导游台、MCP 工具清单、检索可视化</li>
          <li>✓ 注入检测、密钥脱敏、断网与模型失败自动降级</li>
          <li>✓ 所有数据只存本机浏览器，无任何外部请求</li>""",
     r"""          <li>✓ 26 篇方法笔记本地检索 + 抽取式问答，带 [编号] 引用与原文核对</li>
          <li>✓ 按学习目标拆阶段、排复习任务与自测卡片，写操作先确认</li>
          <li>✓ 学习任务 / 笔记 / 长期记忆 / 学习看板 / 复习时间计算</li>
          <li>✓ 语音输入与朗读、新手导览、工具清单、检索可视化</li>
          <li>✓ 出处可核对、密钥脱敏、断网与模型失败自动降级</li>
          <li>✓ 所有数据只存本机浏览器，无任何外部请求</li>"""),
    (r"""        <h3 class="mt-3 text-[16px] font-semibold text-white">更精准、更充分，不是「解锁」</h3>""",
     r"""        <h3 class="mt-3 text-[16px] font-semibold text-white">把同一批笔记讲得更贴合你</h3>"""),
    (r"""          <li>↑ 本地检索片段自动注入上下文，模型基于真实资料作答而非自由发挥</li>
          <li>↑ 自然语言理解更细，能处理口语化、复合条件与多轮追问</li>
          <li>↑ 规划步骤更贴合个人背景，可生成完整文稿与结构化产物卡</li>
          <li>↑ 引用编号与前端卡片一一绑定，答案可逐条溯源</li>
          <li>↑ 401 / 402 / 429 / 断网时自动回退离线引擎，功能不中断</li>
          <li>↑ Key 只存本机 localStorage，可测试、可一键清除</li>""",
     r"""          <li>↑ 本地笔记片段自动注入上下文，模型基于真实方法解读而非空泛建议</li>
          <li>↑ 口语化描述、复合条件与多轮追问都能理解，例如「我总记不住公式」</li>
          <li>↑ 可结合考试日期与每日可用时长，生成完整复习计划与自测清单</li>
          <li>↑ 引用编号与前端卡片一一绑定，每条方法建议都可逐条溯源</li>
          <li>↑ 接口异常 / 断网时自动回退离线引擎，学习不中断</li>
          <li>↑ Key 只存本机 localStorage，可测试、可一键清除</li>"""),
    (r"""        <p class="text-xs font-semibold text-white">按分类浏览全部文档""",
     r"""        <p class="text-xs font-semibold text-white">按分类浏览全部笔记"""),
    (r"""      <p class="mt-5 text-[10.5px] leading-5 text-slate-600">说明：资料为面向学习的中文归纳改写，仅供离线检索与参考，不替代原始官方文档；每篇末尾保留来源出处，重要结论请以官方原文为准。</p>""",
     r"""      <p class="mt-5 text-[10.5px] leading-5 text-slate-600">说明：笔记为中文归纳改写，供离线检索与复习参考，不替代原始论文与专著；每篇末尾保留来源出处，重要结论请对照原文。</p>"""),

    # ---------- 学习看板 ----------
    (r"""        <span class="chip reveal">PRODUCTIVITY BOARD · 真实数据</span>""",
     r"""        <span class="chip reveal">STUDY BOARD · 真实数据</span>"""),
    (r"""<h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">效率看板</h2>""",
     r"""<h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">学习看板</h2>"""),
    (r"""        <p class="reveal mt-2 max-w-2xl text-sm text-slate-400">Agent 在工作台里创建/完成的待办与笔记，实时同步到这里。数据只存在你的浏览器。</p>""",
     r"""        <p class="reveal mt-2 max-w-2xl text-sm text-slate-400">工作台里排下的复习任务、完成的打卡与记下的学习笔记，实时同步到这里。数据只存在你的浏览器。</p>"""),
    (r"""          <span class="text-[10px] font-normal text-slate-500">近 7 天新增任务 / 笔记</span>""",
     r"""          <span class="text-[10px] font-normal text-slate-500">近 7 天新增学习任务 / 笔记</span>"""),
    (r"""        <p class="mb-3 text-xs font-semibold text-white">长期记忆 <span class="ml-1 text-[10px] font-normal text-slate-500">Agent 自动提取</span></p>""",
     r"""        <p class="mb-3 text-xs font-semibold text-white">长期记忆 <span class="ml-1 text-[10px] font-normal text-slate-500">自动记录你的学习目标</span></p>"""),
    (r"""          待办清单
          <span class="text-[10px] font-normal text-slate-500">自然语言增删（工作台）或直接添加</span>""",
     r"""          学习任务
          <span class="text-[10px] font-normal text-slate-500">自然语言增删（工作台）或直接添加</span>"""),
    (r"""placeholder="直接输入待办，回车或点添加" """.rstrip(),
     r"""placeholder="直接输入学习任务，回车或点添加" """.rstrip()),
    (r"""          笔记本
          <span class="text-[10px] font-normal text-slate-500">由 save_note 工具写入</span>""",
     r"""          学习笔记
          <span class="text-[10px] font-normal text-slate-500">由 save_note 工具写入</span>"""),
    (r"""{ label: "本地检索耗时", value: RAG_MS ? RAG_MS + "ms" : "—", cls: "text-glow" },""",
     r"""{ label: "笔记检索耗时", value: RAG_MS ? RAG_MS + "ms" : "—", cls: "text-glow" },"""),
    (r"""{ label: "本次会话工具调用", value: state.toolsRun.length, cls: "text-brand-soft" },""",
     r"""{ label: "本次练习工具调用", value: state.toolsRun.length, cls: "text-brand-soft" },"""),
    (r"""近 7 天还没有数据 — 在工作台创建待办或笔记后，这里会画出你的学习曲线""",
     r"""近 7 天还没有数据 — 在工作台排几条复习任务或记一条笔记后，这里会画出你的学习曲线"""),
    (r"""暂无待办 — 去工作台说「帮我添加一个待办」""",
     r"""暂无学习任务 — 去工作台说「帮我添加一个待办：今晚自测第 3 章」"""),

    # ---------- 训练路径 / 流程 / API / 守则 / CTA / 页脚 ----------
    (r"""<h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">三条学习路径，让 Agent 现场排计划</h2>""",
     r"""<h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">三条训练路径，现场排一份学习计划</h2>"""),
    (r"""        <p class="reveal mt-2 max-w-2xl text-sm text-slate-400">选一条路径点「生成周计划」，引航会真调规划器拆解阶段目标，产出的计划可一键写入效率看板。</p>""",
     r"""        <p class="reveal mt-2 max-w-2xl text-sm text-slate-400">选一条路径点「生成我的周计划」，引航会依据内置笔记拆解阶段目标，产出的计划可一键写进学习看板。</p>"""),
    (r"""LIVE 真接口""", r"""LIVE 现场生成"""),
    (r"""            <li class="flex gap-2"><span class="text-mint">★</span><b class="text-mint">默认离线模式</b>：26 篇资料检索与带引用的问答、规划、待办 / 笔记 / 计算、语音、审批、看板全部可用，零请求零账号</li>
            <li class="flex gap-2"><span class="text-brand-soft">↑</span>配置后：本地检索片段自动注入模型上下文，理解更精准、答案更充分，可生成个性化计划与完整文稿</li>""",
     r"""            <li class="flex gap-2"><span class="text-mint">★</span><b class="text-mint">默认离线模式</b>：26 篇方法笔记检索与带出处的问答、复习计划、学习任务 / 笔记 / 计算、语音、审批、看板全部可用，零请求零账号</li>
            <li class="flex gap-2"><span class="text-brand-soft">↑</span>配置后：本地笔记片段自动注入模型上下文，能结合你的考试日期与作息生成个性化复习计划与完整自测清单</li>"""),
    (r"""    <span class="chip reveal">SAFETY GUARDRAILS</span>""",
     r"""    <span class="chip reveal">STUDY PRINCIPLES</span>"""),
    (r"""<h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">把「可控」做进每一次调用</h2>""",
     r"""<h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">四条使用守则，让方法真的落地</h2>"""),
    (r"""    <h2 class="text-2xl font-bold text-white sm:text-3xl">准备好让 Agent 替你干活了吗</h2>""",
     r"""    <h2 class="text-2xl font-bold text-white sm:text-3xl">准备好把方法变成习惯了吗</h2>"""),
    (r"""    <p class="mt-3 text-sm text-slate-400">输入一个真实目标，观察它规划、调用工具、请求确认、给出引用。</p>""",
     r"""    <p class="mt-3 text-sm text-slate-400">输入一个真实的学习目标，看它排计划、查出处、请求确认并给出可执行的下一步。</p>"""),
    (r"""      <button onclick="openMcpModal()" class="btn-ghost">查看 MCP 工具清单</button>""",
     r"""      <button onclick="openMcpModal()" class="btn-ghost">查看工具清单</button>"""),
    (r"""      <span class="text-slate-500">引航 Navigator · AI Agent 学习 / 办公助手</span>""",
     r"""      <span class="text-slate-500">引航 Navigator · 学习方法与效率工具站</span>"""),
    (r"""    <span>全国高校 AI Web 开发挑战赛作品 · 单文件静态版，可离线部署</span>""",
     r"""    <span>26 篇方法笔记内置 · 单文件静态版，断网可用、可整机拷贝</span>"""),

    # ---------- 工作台 ----------
    (r"""      <button onclick="openMcpModal()" class="btn-ghost !px-3 !py-1.5 !text-xs">MCP 清单</button>""",
     r"""      <button onclick="openMcpModal()" class="btn-ghost !px-3 !py-1.5 !text-xs">工具清单</button>"""),
    (r"""      <button onclick="openApiModal()" class="btn-ghost !px-3 !py-1.5 !text-xs">API 设置</button>""",
     r"""      <button onclick="openApiModal()" class="btn-ghost !px-3 !py-1.5 !text-xs">可选增强</button>"""),
    (r"""            <p class="text-sm font-semibold text-white">给我一个目标，剩下的交给引航</p>""",
     r"""            <p class="text-sm font-semibold text-white">说出一个学习目标，剩下的交给引航</p>"""),
    (r"""            <p class="mt-1 text-xs text-slate-500">试着点击下面的建议，观察完整的 Agent 工作流</p>""",
     r"""            <p class="mt-1 text-xs text-slate-500">试着点击下面的建议，观察「检索 → 计划 → 产出」的完整过程</p>"""),
    (r"""：26 篇资料 + 8 个工具全部可用，回答带原文引用 · <button onclick="openApiModal()" class="underline decoration-dotted transition hover:text-slate-300">配置 Key</button> 可让大模型把同一批资料组织得更精准充分""",
     r"""：26 篇方法笔记 + 8 个学习工具全部可用，回答带原文出处 · <button onclick="openApiModal()" class="underline decoration-dotted transition hover:text-slate-300">配置 Key</button> 可让大模型把同一批笔记组织得更贴合你的情况"""),
    (r"""placeholder="描述你的目标，例如：根据知识库，番茄工作法怎么用？" """.rstrip(),
     r"""placeholder="描述你的学习目标，例如：根据笔记，番茄工作法怎么安排复习？" """.rstrip()),
    (r"""        <div class="text-xs text-slate-500">发送任务后，这里会展示 Agent 的规划、思考轨迹与工具调用记录。</div>""",
     r"""        <div class="text-xs text-slate-500">发送目标后，这里会展示学习计划、检索轨迹与工具调用记录。</div>"""),
    (r"""    <p class="mb-2 mt-4 text-[10px] uppercase tracking-widest text-slate-500">MCP 服务</p>""",
     r"""    <p class="mb-2 mt-4 text-[10px] uppercase tracking-widest text-slate-500">工具分组</p>"""),

    # ---------- 弹窗 ----------
    (r"""      <h3 class="text-sm font-semibold text-white">本地 API 设置 <span class="ml-1 rounded-full bg-mint/10 px-2 py-0.5 text-[10px] font-normal text-mint">可选</span></h3>""",
     r"""      <h3 class="text-sm font-semibold text-white">可选增强设置 <span class="ml-1 rounded-full bg-mint/10 px-2 py-0.5 text-[10px] font-normal text-mint">可选</span></h3>"""),
    (r"""    <p class="mt-1 text-[11px] leading-5 text-slate-500">不填也能用：26 篇资料与全部离线功能已经就绪。配置后，本地检索片段会自动注入模型上下文，让答案更精准更充分。Key 只保存在本浏览器 localStorage，不上传、不落库。</p>""",
     r"""    <p class="mt-1 text-[11px] leading-5 text-slate-500">不填也能用：26 篇方法笔记与全部离线功能已经就绪。配置后，笔记片段会自动注入模型上下文，让学习计划与解答更贴合你的情况。Key 只保存在本浏览器 localStorage，不上传、不落库。</p>"""),
    (r"""      <h3 class="text-sm font-semibold text-white">MCP 工具清单 · Model Context Protocol</h3>""",
     r"""      <h3 class="text-sm font-semibold text-white">学习工具清单 · 8 个本地能力</h3>"""),
    (r"""    <p class="mt-1 text-[11px] text-slate-500">4 个本地服务 · 8 个工具，与 Function Calling 共用同一注册表；⚠ 标记表示写入类工具，执行前会请求人工确认。</p>""",
     r"""    <p class="mt-1 text-[11px] text-slate-500">4 组本地能力 · 8 个工具：查笔记、排任务、存笔记、算时间；⚠ 表示会写入数据，执行前会请你确认。</p>"""),

    # ---------- 注释 / 工具注册表 ----------
    (r"""/* ================= 内置知识库（26 篇 / 7 类 · 本地 RAG 数据源，由 scripts/sync_knowledge.py 同步） ================= */""",
     r"""/* ================= 内置学习方法笔记（26 篇 / 7 类 · 本地检索数据源，由 scripts/sync_knowledge.py 同步） ================= */"""),
    (r"""/* ================= 工具注册表（8 个 · MCP 规范） ================= */""",
     r"""/* ================= 学习工具注册表（8 个 · 本地能力） ================= */"""),
    (r"""  { name: "search_knowledge", label: "知识库检索", mutating: false, effect: "只读：在本地知识库中检索片段",
    description: "当问题涉及学习方法、效率、RAG、Agent、DeepSeek API、竞赛准备等主题时调用，返回带相似度的 Top-K 片段；不确定时先检索再回答",""",
     r"""  { name: "search_knowledge", label: "方法笔记检索", mutating: false, effect: "只读：在 26 篇学习方法笔记中检索片段",
    description: "当问题涉及复习方法、记忆、专注、笔记、计划、习惯、应试、错题与学习科学证据时调用，返回带相似度的 Top-K 片段；不确定时先检索再回答","""),
    (r""" : "知识库未检索到相关内容，请基于通用知识回答并说明这一点。""" [1:],
     r""" : "笔记里没有检索到相关方法，请说明这一点并给出通用的学习建议。""" [1:]),
    (r"""label: "查看待办", mutating: false, effect: "只读：列出全部待办",
    description: "当用户询问有哪些待办、任务清单、今天安排时调用",""",
     r"""label: "查看学习任务", mutating: false, effect: "只读：列出全部学习任务",
    description: "当用户询问有哪些复习任务、今天的学习安排、任务清单时调用","""),
    (r""" : "当前没有任何待办。" """ [1:].rstrip(), r""" : "当前还没有学习任务。" """ [1:].rstrip()),
    (r"""  { name: "add_todo", label: "新增待办", mutating: true, effect: "写入：在待办清单中新增一条记录",
    description: "当用户明确要求创建、添加、安排某个待办任务时调用",""",
     r"""  { name: "add_todo", label: "新增学习任务", mutating: true, effect: "写入：在学习任务清单中新增一条记录",
    description: "当用户明确要求创建、添加、安排某个复习任务或学习打卡时调用","""),
    (r"""description: "待办事项内容" """.rstrip(), r"""description: "学习任务内容，例如「复习第 3 章并自测」" """.rstrip()),
    (r"""`已创建待办：「${todo.title}」${todo.due ? "，截止 " + todo.due : ""}，优先级 ${todo.priority}。当前共 ${state.todos.length} 条待办。`""",
     r"""`已创建学习任务：「${todo.title}」${todo.due ? "，截止 " + todo.due : ""}，优先级 ${todo.priority}。当前共 ${state.todos.length} 条学习任务。`"""),
    (r"""  { name: "complete_todo", label: "完成待办", mutating: true, effect: "写入：将指定待办标记为完成",
    description: "当用户表示某项待办已完成时调用",""",
     r"""  { name: "complete_todo", label: "完成学习任务", mutating: true, effect: "写入：将指定学习任务标记为完成",
    description: "当用户表示某项复习任务已完成时调用","""),
    (r"""`没有找到包含「${title}」的未完成待办。`""", r"""`没有找到包含「${title}」的未完成学习任务。`"""),
    (r"""`已将「${t.title}」标记为完成。剩余未完成 ${state.todos.filter(x => !x.done).length} 条。`""",
     r"""`已将「${t.title}」标记为完成。剩余未完成 ${state.todos.filter(x => !x.done).length} 条学习任务。`"""),
    (r"""  { name: "save_note", label: "保存笔记", mutating: true, effect: "写入：把内容保存到本地笔记本",""",
     r"""  { name: "save_note", label: "保存学习笔记", mutating: true, effect: "写入：把学习要点保存到本地笔记本","""),
    (r"""description: "笔记标题" """.rstrip(), r"""description: "学习笔记标题" """.rstrip()),
    (r"""  { name: "list_notes", label: "查看笔记", mutating: false, effect: "只读：列出已保存的笔记",""",
     r"""  { name: "list_notes", label: "查看学习笔记", mutating: false, effect: "只读：列出已保存的学习笔记","""),
    (r"""description: "当需要精确计算数字表达式（加减乘除、括号、百分比）时调用，不要心算",""",
     r"""description: "当需要计算复习天数、番茄钟总时长、成绩或时间分配时调用，不要心算","""),
    (r"""description: "数学表达式，如 (12+8)*3/2" """.rstrip(),
     r"""description: "学习场景的算式，如 25*4 或 (12+8)*3/2" """.rstrip()),
    (r"""  { id: "mcp-knowledge", name: "knowledge-rag", desc: "本地知识库检索服务：分块索引 + TF-IDF 召回", tools: ["search_knowledge"] },""",
     r"""  { id: "mcp-knowledge", name: "knowledge-rag", desc: "26 篇方法笔记的分块索引与相似度召回", tools: ["search_knowledge"] },"""),
    (r"""  { id: "mcp-task", name: "task-vault", desc: "待办管理服务：创建、查询、完成，写入前人工确认", tools: ["list_todos", "add_todo", "complete_todo"] },""",
     r"""  { id: "mcp-task", name: "task-vault", desc: "学习任务管理：创建、查询、完成，写入前请确认", tools: ["list_todos", "add_todo", "complete_todo"] },"""),
    (r"""  { id: "mcp-note", name: "note-vault", desc: "笔记保管服务：保存与查询学习笔记", tools: ["save_note", "list_notes"] },""",
     r"""  { id: "mcp-note", name: "note-vault", desc: "学习笔记保管：保存与查询自己的复习要点", tools: ["save_note", "list_notes"] },"""),
    (r"""  { id: "mcp-utility", name: "utility-kit", desc: "通用工具集：时间与安全计算", tools: ["get_datetime", "calculate"] },""",
     r"""  { id: "mcp-utility", name: "utility-kit", desc: "时间与计算：今天几号、复习天数、番茄钟时长", tools: ["get_datetime", "calculate"] },"""),

    # ---------- 系统提示 / 规划器 ----------
    (r"""  return `你是「引航 Navigator」，一个 AI Agent 学习/办公任务助手。你可以调用本地工具来完成用户的任务。""",
     r"""  return `你是「引航 Navigator」，一位学习方法教练与复习规划助手。你依据内置的 26 篇学习方法笔记回答，并可调用本地工具帮用户把计划落成任务与笔记。"""),
    (r"""3. 引用诚实：如果使用了知识库检索结果，回答中必须用 [编号] 标注来源；没有使用检索结果时不要虚构引用。""",
     r"""3. 引用诚实：如果使用了笔记检索结果，回答中必须用 [编号] 标注出处；没有使用检索结果时不要虚构引用。"""),
    (r"""优先使用下面「本地知识库检索片段」中的事实作答，并用与片段一致的 [编号] 标注来源。""",
     r"""优先使用下面「本地学习方法笔记片段」中的事实作答，并用与片段一致的 [编号] 标注出处。"""),
    (r"""${ragContext ? "# 本地知识库检索片段（内置于本页，断网亦可检索）\n" + ragContext : ""}""",
     r"""${ragContext ? "# 本地学习方法笔记片段（内置于本页，断网亦可检索）\n" + ragContext : ""}"""),
    (r"""      { title: "按需检索与工具调用", detail: "调用知识库/待办/笔记/计算等工具收集信息" },""",
     r"""      { title: "按需检索与工具调用", detail: "调用笔记检索 / 学习任务 / 笔记 / 计算等工具收集信息" },"""),
    (r"""    needsTools: /(检索|知识库|待办|笔记|计算|几点|时间|查|添加|新建|记录|完成|方法|怎么|如何|什么)/.test(goal),""",
     r"""    needsTools: /(检索|笔记|待办|任务|复习|计划|笔记|计算|几点|时间|查|添加|新建|记录|完成|方法|怎么|如何|什么)/.test(goal),"""),
    (r"""        { role: "system", content: "你是任务规划器。输出严格 JSON：""",
     r"""        { role: "system", content: "你是学习规划器。输出严格 JSON："""),
    (r"""needsTools 判断是否需要调用检索/待办/笔记/时间/计算工具。只输出 JSON。" },""",
     r"""needsTools 判断是否需要调用笔记检索/学习任务/笔记/时间/计算工具。只输出 JSON。" },"""),

    # ---------- 离线引擎文案 ----------
    (r"""    [/知识库|检索|资料|怎么|如何|什么|方法|原理|技巧|区别|为什么|介绍|术语|rag|agent|mcp|owasp|prompt|sse|webgpu|embedding|番茄|复习|费曼|认知负荷|间隔重复|深度工作|笔记法|竞赛|演示|错误码|401|402|429/i, "search_knowledge"],""",
     r"""    [/笔记|资料|检索|怎么|如何|什么|方法|原理|技巧|区别|为什么|介绍|术语|主动回忆|间隔|遗忘曲线|复习|记忆|专注|番茄|费曼|认知负荷|交错练习|康奈尔|卡片盒|错题|真题|拖延|习惯|周回顾|学习计划|高效用/i, "search_knowledge"],"""),
    (r"""    [/有哪些待办|查看待办|当前待办|待办列表|我的待办/i, "list_todos"],""",
     r"""    [/有哪些待办|查看待办|当前待办|待办列表|我的待办|有哪些(学习)?任务|复习安排|今天学什么/i, "list_todos"],"""),
    (r"""    [/添加|加\s*\d|安排|创建一条|清单|待办|任务|提醒|截止/i, "add_todo"],""",
     r"""    [/添加|加\s*\d|安排|创建一条|清单|待办|任务|提醒|截止|复习计划|打卡/i, "add_todo"],"""),
    (r"""    [/计算|等于|平均|总计|\+|×|÷|乘以/i, "calculate"],""",
     r"""    [/计算|等于|平均|总计|番茄钟|复习天数|几小时|\+|×|÷|乘以/i, "calculate"],"""),
    (r"""  const topic = topicHit ? topicHit.category : "本地知识库";""",
     r"""  const topic = topicHit ? topicHit.category : "学习方法笔记";"""),
    (r"""  if (hits.length) steps.push({ title: "检索并核对资料", detail: `命中 ${hits.length} 个片段，来自《${topicHit.title}》等 ${new Set(hits.map(h => h.docId)).size} 篇文档` });""",
     r"""  if (hits.length) steps.push({ title: "检索并核对笔记", detail: `命中 ${hits.length} 个片段，来自《${topicHit.title}》等 ${new Set(hits.map(h => h.docId)).size} 篇方法笔记` });"""),
    (r"""  const head = { calculate: "### 计算结果", add_todo: "### 待办已处理", complete_todo: "### 待办已处理", save_note: "### 笔记已处理", list_todos: "### 当前待办", list_notes: "### 已有笔记", get_datetime: "### 当前时间" }[name] || "### 工具结果";""",
     r"""  const head = { calculate: "### 计算结果", add_todo: "### 学习任务已处理", complete_todo: "### 学习任务已处理", save_note: "### 学习笔记已处理", list_todos: "### 当前学习任务", list_notes: "### 已有学习笔记", get_datetime: "### 当前时间" }[name] || "### 工具结果";"""),
    (r"""  if (intent === "plan") out.push('可以直接说「帮我添加一个待办：今晚完成第一步」，写操作会先弹确认卡片。');""",
     r"""  if (intent === "plan") out.push('可以直接说「帮我添加一个待办：今晚完成第一轮闭卷自测」，写操作会先弹确认卡片。');"""),
    (r"""  else if (intent === "trouble") out.push('到「资料中心」查看《常见问题速查》，里面有 401 / 402 / 429 的完整处理表。');""",
     r"""  else if (intent === "trouble") out.push('到「资料中心」查看《模板速查：日计划、复习排程与常见误区》，里面有可直接照抄的排程表与误区清单。');"""),
    (r"""  L.push("### 本地资料给出的答案");""", r"""  L.push("### 内置学习笔记给出的答案");"""),
    (r"""  L.push("> 当前为**离线模式**（未配置 API Key）。以下要点全部摘自本机内置资料原文，检索、抽取与引用均在本地完成。");""",
     r"""  L.push("> 当前为**离线模式**（未配置 API Key）。以下要点全部摘自本机内置的学习方法笔记原文，检索、抽取与引用均在本地完成。");"""),
    (r"""    L.push("这次检索没有达到可信阈值，本地资料里没有足够相关的片段。可以换用资料中的术语再试：");""",
     r"""    L.push("这次检索没有达到可信阈值，内置笔记里没有足够相关的片段。可以换用笔记中的术语再试：");"""),
    (r"""    L.push("例如：「主动回忆」「RRF 融合」「LLM01 提示注入」「401 错误码」「番茄工作法」「费曼技巧」。");""",
     r"""    L.push("例如：「主动回忆」「间隔重复」「认知负荷」「番茄工作法」「费曼技巧」「错题归因」。");"""),
    (r"""    define: `关于「${goal.replace(/[？?。]/g, "").slice(0, 30)}」，本地资料里最相关的说明集中在《${hits[0].title}》，要点如下。`,""",
     r"""    define: `关于「${goal.replace(/[？?。]/g, "").slice(0, 30)}」，内置学习笔记里最相关的说明集中在《${hits[0].title}》，要点如下。`,"""),
    (r"""    howto: `按本地资料给出的操作要点，可以这样推进（每条都标注了出处编号）。`,""",
     r"""    howto: `按内置笔记给出的操作要点，可以这样推进（每条都标注了出处编号）。`,"""),
    (r"""    compare: `本地资料中与这个问题相关的几条论述可以对照来看。`,""",
     r"""    compare: `内置笔记中与这个问题相关的几条论述可以对照来看。`,"""),
    (r"""    trouble: `先按错误码或失败模式定位，本地资料给出的排查与处理要点如下。`,""",
     r"""    trouble: `先定位是哪一类学习问题，内置笔记给出的判断与处理要点如下。`,"""),
    (r"""    plan: `本地资料命中 ${hits.length} 个片段，下面是可直接落进计划的依据与节奏建议。`,""",
     r"""    plan: `内置笔记命中 ${hits.length} 个片段，下面是可直接落进复习计划的依据与节奏建议。`,"""),
    (r"""    general: `本地知识库命中 ${hits.length} 个片段、涉及 ${new Set(hits.map(h => h.docId)).size} 篇文档，重点如下。`,""",
     r"""    general: `内置学习笔记命中 ${hits.length} 个片段、涉及 ${new Set(hits.map(h => h.docId)).size} 篇笔记，重点如下。`,"""),
    (r"""  L.push(`*资料规模：${KNOWLEDGE_DOCS.length} 篇 / ${RAG.stats.chunks} 个索引分块 / ${KB_CATEGORIES().length} 个分类，全部内置于本页，断网可用。*`);""",
     r"""  L.push(`*笔记规模：${KNOWLEDGE_DOCS.length} 篇 / ${RAG.stats.chunks} 个索引分块 / ${KB_CATEGORIES().length} 个分类，全部内置于本页，断网可用。*`);"""),
    (r"""  return `### 离线模式 · 零配置能力一览
**没有配置 API Key，所有功能照常可用**：${KNOWLEDGE_DOCS.length} 篇内置资料（${cats}）已完成本地索引，检索与问答全部在浏览器内完成。

- 📚 **知识问答**：直接问「根据知识库，番茄工作法怎么用？」→ 给出带 [1][2] 引用的原文要点
- 🧭 **任务规划**：任何目标都会拆成可执行步骤，步骤说明来自真实检索命中
- ✅ **待办管理**：「帮我添加一个待办：xxx」「我现在有哪些待办」「完成 xxx」
- 📝 **笔记与记忆**：「把 xxx 记到笔记里」「记住：我的目标是…」
- 🔢 **精确计算 / 时间**：「算一下 (25+5)×4×3」「今天星期几」
- 🛡 **人工审批**：写入类操作执行前弹确认卡片，拒绝即不执行
- 🎙 **语音输入与朗读**、🧑‍🏫 导游台、🔌 MCP 清单、📊 效率看板：全部离线可用

## 下一步建议
- 试试上方任意一句，或到「资料中心」按分类浏览 ${KNOWLEDGE_DOCS.length} 篇资料
- 到「本地 API」页配置 Key，可让大模型基于同一批资料生成更精准、更充分的个性化答复`;""",
     r"""  return `### 离线模式 · 零配置能力一览
**没有配置 API Key，所有功能照常可用**：${KNOWLEDGE_DOCS.length} 篇学习方法笔记（${cats}）已完成本地索引，检索与问答全部在浏览器内完成。

- 📚 **方法问答**：直接问「根据笔记，番茄工作法怎么安排复习？」→ 给出带 [1][2] 出处的原文要点
- 🧭 **复习规划**：任何学习目标都会拆成可执行阶段，步骤说明来自真实检索命中
- ✅ **任务管理**：「帮我添加一个待办：今晚自测第 3 章」「我现在有哪些待办」「完成 xxx」
- 📝 **笔记与记忆**：「把 xxx 记到笔记里」「记住：我的考试日期是…」
- 🔢 **计算 / 时间**：「算一下 25×4 等于多少分钟」「今天星期几」
- 🛡 **人工确认**：写入类操作执行前弹确认卡片，拒绝即不执行
- 🎙 **语音输入与朗读**、🧑‍🏫 新手导览、🔌 工具清单、📊 学习看板：全部离线可用

## 下一步建议
- 试试上方任意一句，或到「资料中心」按分类浏览 ${KNOWLEDGE_DOCS.length} 篇笔记
- 到「可选增强」页配置 Key，可让大模型基于同一批笔记生成更贴合你的个性化复习计划`;"""),
    (r"""    ref: "《间隔重复、主动回忆与检索练习》",""",
     r"""    ref: "《间隔重复：把总时长摊开，而不是堆在一起》","""),
    (r"""        <span class="text-[10.5px] text-slate-500">26 篇资料实时检索 + 规则引擎 · ${plan.steps.length} 步 · 零配置零请求</span>""",
     r"""        <span class="text-[10.5px] text-slate-500">26 篇方法笔记实时检索 + 本地规划 · ${plan.steps.length} 步 · 零配置零请求</span>"""),
    (r"""        <p class="text-[10px] font-semibold tracking-wider text-mint">离线检索实测 · 命中 ${hits.length} 条 / ${KNOWLEDGE_DOCS.length} 篇内置资料</p>""",
     r"""        <p class="text-[10px] font-semibold tracking-wider text-mint">离线检索实测 · 命中 ${hits.length} 条 / ${KNOWLEDGE_DOCS.length} 篇内置笔记</p>"""),
    (r"""    box.innerHTML = meta + `<p class="rounded-xl border border-dashed border-line py-8 text-center text-xs text-slate-500">未命中：相似度低于阈值（≥0.08），工作台会给出分类引导与换词建议。<br/>可试试「主动回忆」「RRF 融合」「LLM01」「401 错误码」等资料中的术语。</p>`;""",
     r"""    box.innerHTML = meta + `<p class="rounded-xl border border-dashed border-line py-8 text-center text-xs text-slate-500">未命中：相似度低于阈值（≥0.08），工作台会给出分类引导与换词建议。<br/>可试试「主动回忆」「间隔重复」「康奈尔笔记」「番茄工作法」等笔记中的术语。</p>`;"""),
    (r"""没有匹配的资料，换个关键词或分类试试""", r"""没有匹配的笔记，换个关键词或分类试试"""),
    (r"""    : "26 篇资料检索与问答、任务规划、待办 / 笔记 / 计算、语音、审批、看板全部可用；配置 Key 只是让大模型把答案组织得更精准充分。";""",
     r"""    : "26 篇方法笔记检索与问答、复习计划、学习任务 / 笔记 / 计算、语音、审批、看板全部可用；配置 Key 只是让大模型把答案组织得更贴合你的情况。";"""),
    (r""" · 本地 26 篇资料会自动注入上下文；Key 仅存于本浏览器`""",
     r""" · 本地 26 篇方法笔记会自动注入上下文；Key 仅存于本浏览器`"""),
    (r"""  if (/(报错|错误|失败|401|402|429|500|503|为什么不行|没反应|异常|排查|卡住)/i.test(goal)) return "trouble";""",
     r"""  if (/(报错|错误|失败|401|402|429|500|503|为什么不行|没反应|异常|排查|卡住|记不住|学不会|走神|拖延|坚持不下去|没效果|效率低)/i.test(goal)) return "trouble";"""),

    # ---------- Hero 打字机 ----------
    (r"""    "引航先为你的目标做规划，再调用本地知识库、待办、笔记与计算工具，写操作前请求你确认，最后以流式方式给出带引用的答复。",
    "所有轨迹可视、可干预、可追溯 —— 这不是聊天框，是能动手做事的 Agent。",""",
     r"""    "26 篇学习方法笔记装在这一页：从主动回忆、间隔复习到番茄钟与错题本，输入一个问题即可检索原文、排出可执行的练习计划。",
    "每条建议都能点开出处核对原文，写成任务、存进笔记、排进复习 —— 打开就能用，不填 Key 也完整。","""),

    # ---------- 第二轮：可见状态提示与技术味残留 ----------
    (r"""  <!-- 知识库调试台 -->""", r"""  <!-- 检索实验室 -->"""),
    (r"""<!-- MCP 清单弹窗 -->""", r"""<!-- 工具清单弹窗 -->"""),
    (r"""          <li>↑ 401 / 402 / 429 / 断网时自动回退离线引擎，学习不中断</li>""",
     r"""          <li>↑ 接口异常 / 断网时自动回退离线引擎，学习不中断</li>"""),
    (r"""            <li class="flex gap-2"><span class="text-mint">✓</span>401 / 402 / 429 / 断网自动回退离线引擎；可一键测试连通性、恢复默认、清除 Key</li>""",
     r"""            <li class="flex gap-2"><span class="text-mint">✓</span>接口异常或断网时自动回退离线引擎；可一键测试连通性、恢复默认、清除 Key</li>"""),
    (r"""    if (res.status === 401) msg = "API Key 无效或未配置，请在「本地 API 设置」中填写";""",
     r"""    if (res.status === 401) msg = "API Key 无效或未配置，请在「可选增强设置」中填写";"""),
    (r"""      <summary class="cursor-pointer text-[11px] text-mint">引用来源 · ${msg.citations.length} 条知识库片段</summary>""",
     r"""      <summary class="cursor-pointer text-[11px] text-mint">引用来源 · ${msg.citations.length} 条笔记片段</summary>"""),
    (r"""    if (!state.plan) { body.innerHTML = `<div class="text-xs text-slate-500">发送任务后，这里会展示 Agent 的任务规划与步骤进度。</div>`; return; }""",
     r"""    if (!state.plan) { body.innerHTML = `<div class="text-xs text-slate-500">发送目标后，这里会展示学习计划与步骤进度。</div>`; return; }"""),
    (r"""    tools = tools.filter(n => n !== "search_knowledge" || /(知识库|怎么|如何|方法|原理|技巧)/.test(goal));""",
     r"""    tools = tools.filter(n => n !== "search_knowledge" || /(笔记|知识库|怎么|如何|方法|原理|技巧)/.test(goal));"""),
    (r"""  if (name === "search_knowledge") return { query: goal.replace(/(根据知识库|查一下|帮我查|检索|搜索)[，,：:]?/g, "").trim().slice(0, 60) || goal.slice(0, 60), topK: 3 };""",
     r"""  if (name === "search_knowledge") return { query: goal.replace(/(根据笔记|根据知识库|查一下|帮我查|检索|搜索)[，,：:]?/g, "").trim().slice(0, 60) || goal.slice(0, 60), topK: 3 };"""),
    (r"""  setWsStatus("增强模式 · 本地资料 + 大模型");""",
     r"""  setWsStatus("增强模式 · 学习笔记 + 大模型");"""),
    (r"""      setWsStatus("正在调用工具…");""", r"""      setWsStatus("正在执行学习工具…");"""),
    (r"""    setWsStatus("正在生成答复…");""", r"""    setWsStatus("正在整理带出处的答复…");"""),
    (r"""    <span class="typing-dot"><span></span><span></span><span></span></span>正在调用 DeepSeek 规划器（真接口，非录播）…""",
     r"""    <span class="typing-dot"><span></span><span></span><span></span></span>正在调用大模型生成学习计划…"""),
    (r"""    <span class="typing-dot"><span></span><span></span><span></span></span>正在真调规划器拆解目标…""",
     r"""    <span class="typing-dot"><span></span><span></span><span></span></span>正在把目标拆成阶段任务…"""),
    (r"""    badge.textContent = has ? "增强模式 · 本地资料 + 大模型" : "离线模式 · 零配置";""",
     r"""    badge.textContent = has ? "增强模式 · 学习笔记 + 大模型" : "离线模式 · 零配置";"""),
    (r"""    addTrace("rag", `本地检索命中 ${hits.length} 条`,""",
     r"""    addTrace("rag", `笔记检索命中 ${hits.length} 条`,"""),
]

# 常量整块替换：用起止标记切片，避免依赖旧文本的逐字复制
BLOCKS = [
    ("const GUIDE_STEPS = [", "let guideActive = 0", r"""const GUIDE_STEPS = [
  { title: "新手导览", say: "这里是导览台。引航会先把你的学习目标拆成阶段，再从 26 篇方法笔记里找出依据，帮你排复习任务与自测卡片，写操作前请你确认，最后给出能核对原文出处的答复。点右侧任一步骤可自由跳转。", target: "#guide", route: "guide" },
  { title: "方法矩阵", say: "这里列出六件真正能上手的学习工具：方法笔记检索、复习计划、主动回忆自测、学习看板、语音朗读与可选的大模型增强。每一项都能在工作台亲手触发。", target: "#features", route: "features" },
  { title: "一次提问的流程", say: "一次提问背后是四步：读懂目标 → 检索 26 篇笔记 → 拆成可执行的复习步骤 → 给出带出处的答复。点击会在方法矩阵页下方展示完整流程。", target: "#flow", route: "features" },
  { title: "资料中心", say: "26 篇系统笔记、7 个分类、约 3 万字全部装在这一页里，断网也能逐篇展开阅读。每篇都按「核心概念 / 关键结论 / 操作步骤 / 易错点 / 自测题」写成，可直接当复习材料。", target: "#library", route: "library" },
  { title: "可选增强", say: "这一步完全可选：不填任何 Key，上面的功能已经全部可用。填了自己的 DeepSeek Key，笔记片段会自动注入模型上下文，能结合考试日期与作息生成个性化计划。Key 只存在本机浏览器。", target: "#api", route: "api" },
  { title: "开始练习", say: "最后进入工作台：输入一个真实的学习目标，看引航查笔记、排计划、请求确认并给出带出处的答复。自动播放到此步时会直接打开工作台。", target: "#top", route: "try", action: "workspace" },
];
"""),
    ("const FEATURES = [", "const FLOW = [", r"""const FEATURES = [
  { icon: "📚", title: "26 篇方法笔记", desc: "从主动回忆、间隔重复到番茄钟、错题本与周回顾，每篇按核心概念 / 关键结论 / 操作步骤 / 易错点 / 自测题写成，并标注论文与专著来源。", tag: "NOTES 26" },
  { icon: "🔍", title: "带出处的检索问答", desc: "中文二元词 + TF-IDF + 余弦召回，命中片段自动编号；离线引擎抽取原文要点作答，每条结论都能点开核对出处。", tag: "RETRIEVAL" },
  { icon: "🗓", title: "复习计划与排程", desc: "把目标拆成阶段任务，按 1 / 3 / 7 / 15 天排复习，计划可一键写进学习看板，写操作前先请你确认。", tag: "PLANNING" },
  { icon: "✅", title: "任务 · 笔记 · 看板", desc: "用自然语言增删学习任务、保存复习要点、查看近 7 天学习曲线与完成率，数据只存本机浏览器。", tag: "TRACKING" },
  { icon: "🎙", title: "语音输入与朗读", desc: "Web Speech API 语音提问、speechSynthesis 朗读方法要点，走在路上也能复习，零密钥零后端。", tag: "VOICE" },
  { icon: "🧠", title: "可选的大模型增强", desc: "不填 Key 也能完整使用；填了之后同一批笔记注入模型上下文，可生成结合考试日期与作息的个性化复习计划。", tag: "OPTIONAL" },
];
"""),
    ("const FLOW = [", "const SAFETY_ITEMS = [", r"""const FLOW = [
  { n: "01", title: "读懂你的目标", desc: "先判断这是方法咨询、复习排期还是一次自测，识别时间约束与考试日期。" },
  { n: "02", title: "检索内置笔记", desc: "26 篇 / 7 类笔记在浏览器内实时召回，命中片段带相似度，完全离线可用。" },
  { n: "03", title: "拆成可执行的步骤", desc: "本地规划器或大模型把目标拆成阶段任务，排进待办与复习卡片，写操作先确认。" },
  { n: "04", title: "给出带出处的答复", desc: "摘录原文要点或流式生成，每条 [编号] 可展开核对，并附下一步建议。" },
];
"""),
    ("const SAFETY_ITEMS = [", "const SUGGESTIONS = [", r"""const SAFETY_ITEMS = [
  { title: "出处可核对", desc: "每条方法建议都标注 [编号] 引用，可展开对照原文，避免把改写当成定论" },
  { title: "先自测再看答案", desc: "笔记按「自测题 → 答案要点」组织，合上材料再回忆，别让熟悉感冒充掌握" },
  { title: "写入前先确认", desc: "新增学习任务、保存笔记前弹确认卡片，你的复习计划始终由你决定" },
  { title: "数据只在本机", desc: "任务、笔记与记录仅存浏览器，断网可用；配置 Key 也只存在本机 localStorage" },
];
"""),
    ("const SUGGESTIONS = [", "function renderHome()", r"""const SUGGESTIONS = [
  "根据笔记，番茄工作法怎么安排复习？",
  "主动回忆为什么比重读更有效？",
  "间隔复习的卡片该怎么设计？",
  "考前两周怎么排真题和错题本？",
  "帮我添加一个待办：今晚闭卷自测第 3 章",
  "把「先自测再看答案」记到笔记里",
  "算一下 25×4 等于多少分钟",
  "我现在有哪些待办？",
];
"""),
    ("const KB_PRESETS = [", "function renderKb()", r"""const KB_PRESETS = ["怎么复习效果最好？", "主动回忆和重读差在哪？", "复习间隔怎么安排？", "番茄工作法", "康奈尔笔记", "费曼技巧", "错题本怎么写", "考前两周计划"];
"""),
    ("const PATHS = [", "const PATH_BUSY = {}", r"""const PATHS = [
  { icon: "🌱", title: "7 天 · 建立主动回忆习惯", level: "入门", weeks: 1, tags: ["闭卷自测", "卡片设计", "每日复盘"],
    goal: "我总在重读笔记，想用 7 天改成主动回忆的复习方式，每天 40 分钟，帮我排一份周计划" },
  { icon: "📈", title: "4 周 · 搭建间隔复习系统", level: "进阶", weeks: 4, tags: ["遗忘曲线", "复习排程", "交错练习"],
    goal: "我准备期末考，想用 4 周把 60 个知识点排成间隔复习表并配自测卡片，每天 1 小时，帮我排一份周计划" },
  { icon: "🎯", title: "2 周 · 考前冲刺与错题收敛", level: "挑战", weeks: 2, tags: ["限时真题", "错题归因", "周回顾"],
    goal: "两周后考试，我想用限时真题和错题本把薄弱点收敛掉，每天 2 小时，帮我排一份周计划" },
];
"""),
    ("const HERO_STEPS = [", "let heroIdx = 0;", r"""const HERO_STEPS = ["读懂目标", "检索笔记", "拆成步骤", "确认任务", "带出处答复"];
"""),
    ("const TRY_CHIPS = [", "let lastTryGoal =", r"""const TRY_CHIPS = [
  "期末还有三周，帮我排一份间隔复习计划",
  "我总记不住公式，怎么用主动回忆改造复习？",
  "用番茄工作法安排今晚两小时，并加 2 个待办",
  "考前两周怎么用真题和错题本收敛弱项？",
];
"""),
]


def main():
    text = PATH.read_bytes().decode("utf-8").replace("\r\n", "\n")
    original = text
    missing, counts = [], []
    for old, new in REPL:
        n = text.count(old)
        if n == 0:
            # 幂等：允许对已替换过的文件重复运行
            if new and new in text:
                continue
            missing.append(old[:70].replace("\n", "\\n"))
            continue
        text = text.replace(old, new)
        counts.append((n, old[:44].replace("\n", "\\n")))
    for start, end, new in BLOCKS:
        i = text.find(start)
        j = text.find(end, i + len(start)) if i >= 0 else -1
        if i < 0 or j < 0:
            missing.append(f"BLOCK {start} -> {end}")
            continue
        text = text[:i] + new + text[j:]

    if missing:
        print(f"!! 有 {len(missing)} 条未命中，未写入文件：")
        for m in missing:
            print("   -", m)
        raise SystemExit(1)

    PATH.write_bytes(text.encode("utf-8"))
    print(f"文案替换完成：{len(REPL)} 条精确替换 + {len(BLOCKS)} 个常量块")
    print(f"文件：{len(original):,} → {len(text):,} 字符")


if __name__ == "__main__":
    main()
