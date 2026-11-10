# -*- coding: utf-8 -*-
"""
把 Next.js 源码版的可见文案同步为「学习方法工具站」。

只改界面字符串与提示语；路由、组件结构、工具名、SSE 协议与类型定义全部不动。
知识库资料本身由 data/knowledge/*.md 提供，Next.js 版会自动读取，无需改代码。

运行：python scripts/apply_learning_copy_nextjs.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# (相对路径, 旧文案, 新文案)
EDITS = [
    # ---------- 站点 metadata ----------
    ("src/app/layout.tsx", r"""  title: "引航 Navigator · AI Agent 学习与办公任务助手",""",
     r"""  title: "引航 Navigator · 学习方法与效率工具站","""),
    ("src/app/layout.tsx", r"""    "一个具备任务规划、Function Calling 工具调用、Human-in-the-loop 审批与本地 RAG 引用的 AI Agent 学习 / 办公助手。",""",
     r"""    "26 篇系统学习方法笔记内置：主动回忆、间隔重复、番茄钟、错题本与周回顾，零配置可用、断网可查，可排复习计划并核对原文出处。","""),
    ("src/app/layout.tsx", r"""  keywords: ["AI Agent", "DeepSeek", "RAG", "MCP", "学习助手", "办公效率"],""",
     r"""  keywords: ["学习方法", "主动回忆", "间隔重复", "番茄工作法", "错题本", "复习计划"],"""),

    # ---------- 首页 ----------
    ("src/app/page.tsx", r"""    title: "认识你的 AI 领航员",""", r"""    title: "认识你的学习导游","""),
    ("src/app/page.tsx", r"""    say: "欢迎来到引航。我不是一个只会聊天的输入框，而是一个会把目标拆成步骤、调用工具、再回来向你确认的 Agent。",""",
     r"""    say: "欢迎来到引航。这不是一个收藏学习方法的书单，而是会把你的目标拆成阶段、找出笔记里的依据、再陪你把复习任务排进日历的工具站。","""),
    ("src/app/page.tsx", r"""    title: "四项核心 AI 能力",""", r"""    title: "四件真正能用的学习工具","""),
    ("src/app/page.tsx", r"""    say: "Agent 规划、Function Calling 工具链、本地 RAG 引用溯源、Human-in-the-loop 审批，全部在真实链路里运行。",""",
     r"""    say: "方法笔记检索、复习计划排程、带出处的引用核对、写入前人工确认，全部在真实链路里运行。","""),
    ("src/app/page.tsx", r"""    say: "你只需要说清目标：规划 → 工具执行 → 人工确认 → 流式答复 → 写入记忆。每一步都能在右侧轨迹里追溯。",""",
     r"""    say: "你只需要说清学习目标：读懂目标 → 检索笔记 → 拆成阶段任务 → 确认写入 → 带出处答复。每一步都能在右侧轨迹里追溯。","""),
    ("src/app/page.tsx", r"""    say: "不配置也已经能完整使用：本地引擎会规划、检索、调用工具并给出带引用的答复。若想更精准，点右上角填入自己的 DeepSeek Key，它只保存在你的浏览器里，不会写入服务器。",""",
     r"""    say: "不配置也已经能完整使用：26 篇方法笔记会本地检索、排复习计划并给出带出处的答复。若想更贴合你的考试日期与作息，点右上角填入自己的 DeepSeek Key，它只保存在浏览器里。","""),
    ("src/app/page.tsx", r"""    say: "准备就绪。去工作台试试：帮我制定两周复习计划，检索学习方法，并把关键任务写进待办。",""",
     r"""    say: "准备就绪。去工作台试试：帮我排一份考前三周的间隔复习计划，检索主动回忆的做法，并把关键任务写进学习清单。","""),
    ("src/app/page.tsx", r"""    title: "自主任务规划",""", r"""    title: "复习计划拆解","""),
    ("src/app/page.tsx", r"""    description: "理解目标后先产出可编辑的步骤计划，执行过程中逐步回写状态，避免黑盒式回答。",""",
     r"""    description: "把「期末还有三周」拆成阶段目标与每日任务，执行过程中逐步回写状态，计划看得见也改得动。","""),
    ("src/app/page.tsx", r"""    title: "Function Calling 工具链",""", r"""    title: "学习工具链","""),
    ("src/app/page.tsx", r"""    description: "8 个真实工具：知识检索、待办增删、笔记沉淀、时间与精确计算，最多 3 轮自主调用。",""",
     r"""    description: "8 个本地工具：方法笔记检索、学习任务增删、复习笔记沉淀、时间与番茄钟计算，最多 3 轮自主调用。","""),
    ("src/app/page.tsx", r"""    description: "所有写操作都会挂起并弹出审批卡片，展示参数与影响范围，拒绝后 Agent 自动给出替代方案。",""",
     r"""    description: "所有写操作都会挂起并弹出审批卡片，展示任务内容与影响范围，拒绝后引擎会给出替代方案。","""),
    ("src/app/page.tsx", r"""    title: "本地 RAG 引用溯源",""", r"""    title: "方法笔记引用溯源","""),
    ("src/app/page.tsx", r"""    description: "文档自动分块、中文二元词向量化、相似度召回；答复标注 [1][2]，可跳转查看原文片段。",""",
     r"""    description: "26 篇笔记自动分块、中文二元词向量化、相似度召回；答复标注 [1][2]，可展开核对原文片段。","""),
    ("src/app/page.tsx", r"""    description: "自动提取稳定的偏好与目标，去重后存入本地记忆，并在后续对话中注入上下文。",""",
     r"""    description: "记住你的考试日期、每日可用时长与薄弱科目，去重后存入本地记忆，后续排计划时自动带上。","""),
    ("src/app/page.tsx", r"""    title: "MCP 工具清单",""", r"""    title: "学习工具清单","""),
    ("src/app/page.tsx", r"""    description: "按 Model Context Protocol 的工具描述规范组织 4 个本地服务，能力边界清晰可审计。",""",
     r"""    description: "4 组本地能力：查笔记、排任务、存笔记、算时间，边界清晰、写入前可审计。","""),
    ("src/app/page.tsx", r"""    detail: "用一句自然语言说明你想完成的学习或办公任务。",""",
     r"""    detail: "用一句话说明你的学习目标，例如「期末还有三周，帮我排间隔复习」。","""),
    ("src/app/page.tsx", r"""    detail: "Agent 拆解为 2-4 个可执行步骤，并同步到规划面板。",""",
     r"""    detail: "引擎拆解为 2-4 个可执行的复习阶段，并同步到规划面板。","""),
    ("src/app/page.tsx", r"""    detail: "自主选择检索、待办或笔记工具；写操作等待你确认。",""",
     r"""    detail: "自主选择笔记检索、学习任务或笔记工具；写操作等待你确认。","""),
    ("src/app/page.tsx", r"""    detail: "流式输出结论、引用与下一步建议，并沉淀长期记忆。",""",
     r"""    detail: "流式输出结论、出处与下一步复习动作，并记住你的备考约束。","""),
    ("src/app/page.tsx", r"""const TECH = ["Next.js 14", "TypeScript", "DeepSeek API", "SSE Streaming", "Function Calling", "Local RAG", "MCP", "Zustand"];""",
     r"""const TECH = ["主动回忆", "间隔重复", "交错练习", "番茄工作法", "康奈尔笔记", "费曼技巧", "错题归因", "周回顾"];"""),
    ("src/app/page.tsx", r"""                  AI Agent · 学习 / 办公任务助手""", r"""                  学习方法与效率工具站"""),
    ("src/app/page.tsx", r"""                  26 篇资料内置 · 零配置可用""", r"""                  26 篇方法笔记内置 · 零配置可用"""),
    ("src/app/page.tsx", r"""                让 Agent <span className="gradient-text">走完每一步</span>""",
     r"""                把方法<span className="gradient-text">练成习惯</span>"""),
    ("src/app/page.tsx", r"""                不只回答问题，而是真正推进任务。自动规划、工具调用、人工确认、知识库引用与长期记忆，
                组成一条可解释、可干预、可追溯的 Agent 执行链路。不填任何 API Key 也能完整使用；
                配置后，26 篇内置资料会交给大模型深度组织，答案更精准更充分。""",
     r"""                不只讲方法，而是陪你把方法排进日程。26 篇系统笔记、复习计划、任务看板与带出处的问答，
                组成一条可核对、可干预、可追溯的学习闭环。不填任何 API Key 也能完整使用；
                配置后，同一批笔记会交给大模型结合你的考试日期与作息深度组织。"""),
    ("src/app/page.tsx", r"""              { value: "6", label: "内置知识文档" },""", r"""              { value: "26", label: "内置方法笔记" },"""),
    ("src/app/page.tsx", r"""              { value: "8", label: "可调用工具" },""", r"""              { value: "8", label: "本地学习工具" },"""),
    ("src/app/page.tsx", r"""              小引会用 5 步带你熟悉整个产品，点击任意步骤还能直接定位到页面对应区域。""",
     r"""              小引会用 5 步带你把这套学习方法走一遍，点击任意步骤还能直接定位到页面对应区域。"""),
    ("src/app/page.tsx", r"""            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-[28px]">不是聊天框套壳，是完整 Agent 链路</h2>""",
     r"""            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-[28px]">不是又一份书单，是完整的练习闭环</h2>"""),
    ("src/app/page.tsx", r"""              规划、工具、审批、检索、记忆、协议六层能力全部真实接入，每一层都能在界面中被观察和干预。""",
     r"""              检索、计划、任务、审批、笔记、复盘六层能力全部真实接入，每一层都能在界面中被观察和干预。"""),
    ("src/app/page.tsx", r"""                默认零配置即可使用：26 篇内置资料、本地规划、8 个工具、人工审批、语音与看板全部可用，
                断网也能跑完整的 Agent 闭环。配置自己的 DeepSeek Key 后，本地检索片段会自动注入模型上下文，
                规划更贴合你、答案更充分；401 / 402 / 429 / 断网时自动回退离线引擎，功能不中断。""",
     r"""                默认零配置即可使用：26 篇方法笔记、复习计划、8 个工具、人工确认、语音与学习看板全部可用，
                断网也能跑完整闭环。配置自己的 DeepSeek Key 后，笔记片段会自动注入模型上下文，
                能结合考试日期与作息排出个性化计划；接口异常或断网时自动回退离线引擎。"""),
    ("src/app/page.tsx", r"""                AI 安全护栏""", r"""                四条使用守则"""),
    ("src/app/page.tsx", r"""                <li>· 输入侧提示注入与越权指令检测</li>""", r"""                <li>· 每条方法建议都可展开核对原文出处</li>"""),
    ("src/app/page.tsx", r"""                <li>· 写操作强制 Human-in-the-loop 确认</li>""", r"""                <li>· 学习任务与笔记写入前先请你确认</li>"""),
    ("src/app/page.tsx", r"""                <li>· 输出侧 API Key 等敏感信息自动脱敏</li>""", r"""                <li>· 任务、笔记与记录只保存在本机浏览器</li>"""),
    ("src/app/page.tsx", r"""                <li>· 系统提示明确禁止编造引用与越界操作</li>""", r"""                <li>· 系统提示明确禁止编造引用编号与出处</li>"""),
    ("src/app/page.tsx", r"""              现在开始你的第一个 Agent 任务""", r"""              现在开始你的第一轮复习计划"""),
    ("src/app/page.tsx", r"""              试用示例：帮我制定两周复习计划，检索高效学习方法，并把关键任务写进待办。""",
     r"""              试用示例：帮我排一份考前三周的间隔复习计划，检索主动回忆的做法，并把关键任务写进学习清单。"""),

    # ---------- 知识库页 ----------
    ("src/app/knowledge/page.tsx", r"""  const [query, setQuery] = useState("费曼学习法怎么用");""",
     r"""  const [query, setQuery] = useState("主动回忆为什么比重读更有效");"""),
    ("src/app/knowledge/page.tsx", r"""      runSearch("费曼学习法怎么用", 4);""",
     r"""      runSearch("主动回忆为什么比重读更有效", 4);"""),
    ("src/app/knowledge/page.tsx", r"""              RAG · 检索调试台""", r"""              RETRIEVAL LAB · 笔记检索台"""),
    ("src/app/knowledge/page.tsx", r"""            <h1 className="mt-3 text-2xl font-semibold text-white sm:text-[28px]">本地知识库</h1>""",
     r"""            <h1 className="mt-3 text-2xl font-semibold text-white sm:text-[28px]">内置学习方法笔记</h1>"""),
    ("src/app/knowledge/page.tsx", r"""              Agent 回答中的引用编号与这里的检索结果一一对应。""",
     r"""              工作台回答里的 [编号] 出处与这里的检索结果一一对应。"""),
    ("src/app/knowledge/page.tsx", r"""            {showUpload ? "收起上传" : "上传资料"}""", r"""            {showUpload ? "收起上传" : "添加我的笔记"}"""),
    ("src/app/knowledge/page.tsx", r"""            { icon: FileText, label: "文档", value: stats.docs },""",
     r"""            { icon: FileText, label: "方法笔记", value: stats.docs },"""),
    ("src/app/knowledge/page.tsx", r"""              placeholder="粘贴你的学习资料、课程笔记或文档内容…（至少 30 字）" """.rstrip(),
     r"""              placeholder="粘贴你的课堂笔记、复习要点或摘录内容…（至少 30 字）" """.rstrip()),
    ("src/app/knowledge/page.tsx", r"""                  写入知识库""", r"""                  加入笔记库"""),
    ("src/app/knowledge/page.tsx", r"""                    placeholder="输入检索问题，例如：间隔重复的复习节奏" """.rstrip(),
     r"""                    placeholder="输入学习问题，例如：复习间隔怎么安排" """.rstrip()),
    ("src/app/knowledge/page.tsx", r"""                  <p className="mt-1 text-[10.5px] text-slate-600">尝试换一个关键词，或上传相关资料。</p>""",
     r"""                  <p className="mt-1 text-[10.5px] text-slate-600">换个笔记里的术语试试，例如主动回忆、认知负荷、错题归因。</p>"""),
    ("src/app/knowledge/page.tsx", r"""                  已入库文档""", r"""                  已加入的笔记"""),

    # ---------- 工作台 ----------
    ("src/app/workspace/page.tsx", r"""    say: "在中间输入框中描述任务。引航会先规划，再决定是否检索知识库或写入待办，而不是直接胡答。",""",
     r"""    say: "在中间输入框中描述学习目标。引航会先拆阶段，再检索方法笔记或排复习任务，而不是直接给空泛建议。","""),
    ("src/app/workspace/page.tsx", r"""    say: "新增待办、保存笔记这类写操作会弹出橙色审批卡片，展示具体参数与影响范围，你拒绝后 Agent 会换方案。",""",
     r"""    say: "新增学习任务、保存笔记这类写操作会弹出橙色确认卡片，展示具体内容与影响范围，你拒绝后引擎会换方案。","""),
    ("src/app/workspace/page.tsx", r"""    say: "右上角「本地 API 设置」可填写自己的 DeepSeek Key。它只存在浏览器 localStorage，不会写入服务端。",""",
     r"""    say: "右上角「可选增强设置」可填写自己的 DeepSeek Key。它只存在浏览器 localStorage，不会写入服务端。","""),
    ("src/app/workspace/page.tsx", r"""    title: "检索学习方法",""", r"""    title: "查一个学习方法","""),
    ("src/app/workspace/page.tsx", r"""    prompt: "费曼学习法和间隔重复应该怎么配合使用？请引用知识库资料回答。",""",
     r"""    prompt: "主动回忆和间隔重复应该怎么配合使用？请引用内置笔记回答。","""),
    ("src/app/workspace/page.tsx", r"""    prompt: "检索 RAG 的分块策略，总结成一篇笔记并帮我保存下来。",""",
     r"""    prompt: "检索错题本的写法，总结成一篇复习笔记并帮我保存下来。","""),
    ("src/app/workspace/page.tsx", r"""                      <h2 className="mt-4 text-xl font-semibold text-white">今天想推进什么任务？</h2>""",
     r"""                      <h2 className="mt-4 text-xl font-semibold text-white">今天想练会哪一件事？</h2>"""),
    ("src/app/workspace/page.tsx", r"""                        说出目标即可。Agent 会先拆解步骤，再调用 8 个本地工具；涉及写入时一定会先征求你的确认。""",
     r"""                        说出学习目标即可。引航会先拆解阶段，再查 26 篇方法笔记、调用 8 个本地工具；涉及写入时一定会先征求你的确认。"""),
    ("src/app/workspace/page.tsx", r"""                        <span className="rounded-full border border-line px-2 py-0.5">RAG 引用</span>""",
     r"""                        <span className="rounded-full border border-line px-2 py-0.5">笔记出处</span>"""),
    ("src/app/workspace/page.tsx", r"""        description="规划、工具轨迹与 MCP 服务" """.rstrip(),
     r"""        description="复习计划、检索轨迹与工具分组" """.rstrip()),

    # ---------- 导航 / Hero 视觉 / 导游台 / 设置弹窗 ----------
    ("src/components/site-nav.tsx", r"""  { href: "#guide", label: "导游台" },""", r"""  { href: "#guide", label: "新手导览" },"""),
    ("src/components/site-nav.tsx", r"""  { href: "#capabilities", label: "能力矩阵" },""", r"""  { href: "#capabilities", label: "方法矩阵" },"""),
    ("src/components/site-nav.tsx", r"""  { href: "/knowledge", label: "知识库", external: true },""", r"""  { href: "/knowledge", label: "笔记库", external: true },"""),
    ("src/components/site-nav.tsx", r"""            {hasOwnKey ? "我的 API · 已配置" : "本地 API 设置"}""",
     r"""            {hasOwnKey ? "可选增强 · 已配置" : "配置可选增强"}"""),
    ("src/components/home/hero-visual.tsx", r"""  { label: "检索知识库 · Top-4", icon: BookOpenCheck },""",
     r"""  { label: "检索方法笔记 · Top-4", icon: BookOpenCheck },"""),
    ("src/components/home/hero-visual.tsx", r"""  { label: "写入学习待办 · 等待确认", icon: ShieldCheck },""",
     r"""  { label: "写入复习任务 · 等待确认", icon: ShieldCheck },"""),
    ("src/components/home/hero-visual.tsx", r"""            Agent 运行中""", r"""            学习闭环运行中"""),
    ("src/components/home/hero-visual.tsx", r"""              写入待办""", r"""              新增复习任务"""),
    ("src/components/home/hero-visual.tsx", r"""            帮我制定两周的考研复习计划，并检索知识库里的高效学习方法。""",
     r"""            帮我排一份考前三周的间隔复习计划，并检索主动回忆的做法。"""),
    ("src/components/guide/guide-console.tsx", r"""                  <span className="text-[10px] text-slate-500">AI 导览</span>""",
     r"""                  <span className="text-[10px] text-slate-500">学习导览</span>"""),
    ("src/components/guide/guide-console.tsx", r"""            GUIDE CONSOLE · 全程陪伴""", r"""            GUIDE CONSOLE · 六步上手"""),
    ("src/components/guide/guide-console.tsx", r"""                引航的 AI 导游。第一次来？<br />我带你走完整个工作流。""",
     r"""                引航的学习导游。第一次来？<br />我带你把这套方法走一遍。"""),
    ("src/components/settings/api-key-dialog.tsx", r"""      title="本地 API 设置" """.rstrip(), r"""      title="可选增强设置" """.rstrip()),
    ("src/components/settings/api-key-dialog.tsx", r"""      description="使用你自己的 DeepSeek API Key。配置只保存在当前浏览器，不写入服务器存储或代码仓库。" """.rstrip(),
     r"""      description="可选：填入自己的 DeepSeek API Key，让 26 篇方法笔记结合你的考试日期与作息组织成个性化计划。配置只保存在当前浏览器。" """.rstrip()),
    ("src/components/settings/api-key-dialog.tsx", r"""              placeholder="留空则使用站点默认密钥（服务端环境变量）" """.rstrip(),
     r"""              placeholder="留空即使用完整离线功能" """.rstrip()),
    ("src/components/settings/api-key-dialog.tsx", r"""              : "当前使用站点默认密钥；填写后将优先使用你的 Key。"}""",
     r"""              : "当前为离线模式，26 篇方法笔记与全部功能已就绪；填写后将启用增强层。"}"""),

    # ---------- 离线引擎答复 ----------
    ("src/lib/agent/guest-run.ts", r"""  if (/(报错|错误|失败|401|402|429|500|503|异常|排查|卡住)/i.test(goal)) return "trouble";""",
     r"""  if (/(报错|错误|失败|401|402|429|500|503|异常|排查|卡住|记不住|学不会|走神|拖延|坚持不下去|没效果|效率低)/i.test(goal)) return "trouble";"""),
    ("src/lib/agent/guest-run.ts", r"""  L.push("### 本地资料给出的答案");""", r"""  L.push("### 内置学习笔记给出的答案");"""),
    ("src/lib/agent/guest-run.ts", r"""    "> 当前为**离线模式**（未配置 API Key）。以下要点全部摘自本机内置资料原文，检索、抽取与引用均在本地完成。",""",
     r"""    "> 当前为**离线模式**（未配置 API Key）。以下要点全部摘自本机内置的学习方法笔记原文，检索、抽取与引用均在本地完成。","""),
    ("src/lib/agent/guest-run.ts", r"""    L.push("这次检索没有达到可信阈值，本地资料里没有足够相关的片段。可以换用资料中的术语再试：");""",
     r"""    L.push("这次检索没有达到可信阈值，内置笔记里没有足够相关的片段。可以换用笔记中的术语再试：");"""),
    ("src/lib/agent/guest-run.ts", r"""    L.push("「主动回忆」「RRF 融合」「LLM01 提示注入」「401 错误码」「番茄工作法」「费曼技巧」等。");""",
     r"""    L.push("「主动回忆」「间隔重复」「认知负荷」「番茄工作法」「费曼技巧」「错题归因」等。");"""),
    ("src/lib/agent/guest-run.ts", r"""    L.push("- 到知识库页面按分类浏览全部内置资料");""",
     r"""    L.push("- 到笔记库页面按分类浏览 26 篇系统笔记");"""),
    ("src/lib/agent/guest-run.ts", r"""    L.push("- 也可直接说「帮我添加一个待办：…」使用本地工具");""",
     r"""    L.push("- 也可直接说「帮我添加一个待办：今晚闭卷自测第 3 章」把计划落成任务");"""),
    ("src/lib/agent/guest-run.ts", r"""    howto: "按本地资料给出的操作要点，可以这样推进（每条都标注了出处编号）。",""",
     r"""    howto: "按内置笔记给出的操作要点，可以这样推进（每条都标注了出处编号）。","""),
    ("src/lib/agent/guest-run.ts", r"""    compare: "本地资料中与这个问题相关的几条论述可以对照来看。",""",
     r"""    compare: "内置笔记中与这个问题相关的几条论述可以对照来看。","""),
    ("src/lib/agent/guest-run.ts", r"""    trouble: "先按错误码或失败模式定位，本地资料给出的排查与处理要点如下。",""",
     r"""    trouble: "先定位是哪一类学习问题，内置笔记给出的判断与处理要点如下。","""),
    ("src/lib/agent/guest-run.ts", r"""    plan: `本地资料命中 ${hits.length} 个片段，下面是可直接落进计划的依据与节奏建议。`,""",
     r"""    plan: `内置笔记命中 ${hits.length} 个片段，下面是可直接落进复习计划的依据与节奏建议。`,"""),
    ("src/lib/agent/guest-run.ts", r"""    general: `本地知识库命中 ${hits.length} 个片段，重点如下。`,""",
     r"""    general: `内置学习笔记命中 ${hits.length} 个片段，重点如下。`,"""),
    ("src/lib/agent/guest-run.ts", r"""      : "- 配置 API Key 后，可让大模型把这些片段组织成更贴合你语境的完整文稿与个性化计划",""",
     r"""      : "- 配置 API Key 后，可让大模型结合这些笔记与你的考试日期生成个性化复习计划","""),
    ("src/lib/agent/guest-run.ts", r"""  L.push("*资料全部内置于本机，断网可用；未产生任何外部请求。*");""",
     r"""  L.push("*26 篇方法笔记全部内置于本机，断网可用；未产生任何外部请求。*");"""),
    ("src/lib/agent/guest-run.ts", r"""    [/知识库|检索|资料|怎么|如何|什么|方法|原理|技巧|区别|为什么|介绍|术语|rag|agent|mcp|owasp|prompt|sse|webgpu|embedding|番茄|复习|费曼|认知负荷|间隔重复|竞赛|演示|错误码|401|402|429/i, "search_knowledge"],""",
     r"""    [/笔记|资料|检索|怎么|如何|什么|方法|原理|技巧|区别|为什么|介绍|术语|主动回忆|间隔|遗忘曲线|复习|记忆|专注|番茄|费曼|认知负荷|交错练习|康奈尔|卡片盒|错题|真题|拖延|习惯|周回顾|学习计划|高效用/i, "search_knowledge"],"""),

    # ---------- 工具描述（会出现在检查器 / 工具清单中） ----------
    ("src/lib/agent/tools.ts", r"""    label: "知识库检索",""", r"""    label: "方法笔记检索","""),
    ("src/lib/agent/tools.ts", r"""      "在企业/个人本地知识库中做混合检索，返回与问题最相关的资料片段与相似度。涉及学习方法、AI 技术、项目排期等知识性问题时必须优先调用。",""",
     r"""      "在 26 篇学习方法笔记中检索，返回与问题最相关的片段与相似度。涉及记忆、专注、笔记、计划、应试等学习问题时必须优先调用。","""),
    ("src/lib/agent/tools.ts", r"""        return { content: "本地知识库未检索到相关内容。请基于通用知识谨慎回答，并提示用户可以上传自己的资料。" };""",
     r"""        return { content: "内置笔记未检索到相关方法。请谨慎给出通用学习建议，并提示用户可添加自己的笔记。" };"""),
    ("src/lib/agent/tools.ts", r"""        content: `知识库检索到 ${hits.length} 条片段，请引用时标注 [编号]：\n\n${body}`,""",
     r"""        content: `方法笔记检索到 ${hits.length} 条片段，请引用时标注 [编号]：\n\n${body}`,"""),
    ("src/lib/agent/tools.ts", r"""    label: "查看待办",""", r"""    label: "查看学习任务","""),
    ("src/lib/agent/tools.ts", r"""    description: "读取当前用户的全部待办事项及状态，用于回答进度、规划复习安排。",""",
     r"""    description: "读取当前用户的全部学习任务及状态，用于回答进度、规划复习安排。","""),
    ("src/lib/agent/tools.ts", r"""      if (!todos.length) return { content: "当前待办列表为空。" };""",
     r"""      if (!todos.length) return { content: "当前学习任务列表为空。" };"""),
    ("src/lib/agent/tools.ts", r"""      return { content: `当前共 ${todos.length} 条待办：\n${lines.join("\n")}` };""",
     r"""      return { content: `当前共 ${todos.length} 条学习任务：\n${lines.join("\n")}` };"""),
    ("src/lib/agent/tools.ts", r"""    label: "新增待办",""", r"""    label: "新增学习任务","""),
    ("src/lib/agent/tools.ts", r"""    effect: "会写入本地待办数据，需用户确认",""", r"""    effect: "会写入本地学习任务，需用户确认","""),
    ("src/lib/agent/tools.ts", r"""        title: { type: "string", description: "待办标题，具体可执行" },""",
     r"""        title: { type: "string", description: "学习任务标题，具体可执行" },"""),
    ("src/lib/agent/tools.ts", r"""      return { content: `已创建待办：${todo.title}（id: ${todo.id}，优先级: ${todo.priority}）` };""",
     r"""      return { content: `已创建学习任务：${todo.title}（id: ${todo.id}，优先级: ${todo.priority}）` };"""),
    ("src/lib/agent/tools.ts", r"""    label: "完成待办",""", r"""    label: "完成学习任务","""),
    ("src/lib/agent/tools.ts", r"""    description: "将指定 id 的待办标记为已完成。",""", r"""    description: "将指定 id 的学习任务标记为已完成。","""),
    ("src/lib/agent/tools.ts", r"""      return { content: `已完成待办：${todo.title}` };""", r"""      return { content: `已完成学习任务：${todo.title}` };"""),
    ("src/lib/agent/tools.ts", r"""    label: "保存笔记",""", r"""    label: "保存学习笔记","""),
    ("src/lib/agent/tools.ts", r"""    label: "查看笔记",""", r"""    label: "查看学习笔记","""),

    # ---------- MCP 服务描述 ----------
    ("src/lib/agent/mcp.ts", r"""    description: "本地知识库检索服务：TF-IDF 召回 + 分块索引，支持相似度可视化",""",
     r"""    description: "26 篇方法笔记检索：分块索引 + TF-IDF 召回，支持相似度可视化","""),
    ("src/lib/agent/mcp.ts", r"""        description: "在本地知识库中检索 Top-K 片段并返回相似度",""",
     r"""        description: "在内置学习笔记中检索 Top-K 片段并返回相似度","""),
    ("src/lib/agent/mcp.ts", r"""    description: "待办管理服务：创建、查询、完成待办，写入前触发人工确认",""",
     r"""    description: "学习任务管理：创建、查询、完成，写入前触发人工确认","""),
    ("src/lib/agent/mcp.ts", r"""      { name: "list_todos", description: "列出全部待办及状态", mutating: false },""",
     r"""      { name: "list_todos", description: "列出全部学习任务及状态", mutating: false },"""),
    ("src/lib/agent/mcp.ts", r"""      { name: "add_todo", description: "新增待办（需审批）", mutating: true },""",
     r"""      { name: "add_todo", description: "新增学习任务（需审批）", mutating: true },"""),
    ("src/lib/agent/mcp.ts", r"""      { name: "complete_todo", description: "完成待办（需审批）", mutating: true },""",
     r"""      { name: "complete_todo", description: "完成学习任务（需审批）", mutating: true },"""),
    ("src/lib/agent/mcp.ts", r"""    description: "笔记沉淀服务：保存 Markdown 笔记、回溯历史结论",""",
     r"""    description: "学习笔记沉淀：保存复习要点、回溯历史结论","""),
    ("src/lib/agent/mcp.ts", r"""    description: "通用工具集：系统时间与安全表达式求值",""",
     r"""    description: "时间与计算：今天几号、复习天数、番茄钟时长","""),

    # ---------- 服务端提示 ----------
    ("src/app/api/agent/route.ts", r"""# 本地知识库检索片段（内置于本机，优先引用）""",
     r"""# 本地学习方法笔记片段（内置于本机，优先引用）"""),
    ("src/app/api/agent/route.ts", r"""${localContext || "本次没有可信命中，请说明知识库未覆盖，不要编造引用。"}""",
     r"""${localContext || "本次没有可信命中，请说明内置笔记未覆盖，不要编造引用。"}"""),
    ("src/app/api/agent/route.ts", r"""            title: `RAG 命中 ${citations.length} 条知识片段`,""",
     r"""            title: `笔记检索命中 ${citations.length} 条片段`,"""),
]


def main():
    by_file = {}
    for rel, old, new in EDITS:
        by_file.setdefault(rel, []).append((old, new))

    applied, skipped = 0, []
    for rel, pairs in by_file.items():
        path = ROOT / rel
        raw = path.read_bytes().decode("utf-8").replace("\r\n", "\n")
        for old, new in pairs:
            if old in raw:
                raw = raw.replace(old, new)
                applied += 1
            elif new in raw:
                continue  # 幂等：已经替换过
            else:
                skipped.append((rel, old[:60].replace("\n", "\\n")))
        path.write_bytes(raw.encode("utf-8"))

    print(f"源码版文案同步：{applied} 条替换，覆盖 {len(by_file)} 个文件")
    if skipped:
        print(f"未命中（已跳过，属版本差异）：{len(skipped)} 条")
        for rel, s in skipped:
            print(f"   - {rel}: {s}")


if __name__ == "__main__":
    main()
