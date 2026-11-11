# -*- coding: utf-8 -*-
"""
补丁 A：导航由 8 项合并为 5 项 + 五个板块的页面骨架重排

合并方案（功能一个不丢，旧 hash 全部保留为重定向别名）：
  试一试（try）        ← 原 试一试 + 新手导览（guide）
  方法与路径（features）← 原 方法矩阵（features）+ 训练路径（scenes）+ 工作流程（flow）
  笔记库（library）     ← 原 检索实验室（knowledge）+ 资料中心（library）
  学习看板（board）
  可选增强（api）       ← 原 本地 API 设置 + 使用守则

运行：python scripts/patch_merge_a.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"

miss = []


def repl(text, old, new):
    """精确替换；若已是新值则跳过（幂等）。"""
    if old in text:
        return text.replace(old, new)
    if new and new in text:
        return text
    miss.append("repl: " + old[:64].replace("\n", "\\n"))
    return text


def splice(text, start, end, new):
    """用 start/end 标记切开并替换中间内容（幂等：已替换过则跳过）。"""
    if new and new in text:
        return text
    i = text.find(start)
    j = text.find(end, i + len(start)) if i >= 0 else -1
    if i < 0 or j < 0:
        miss.append("splice: " + start[:64].replace("\n", "\\n"))
        return text
    if text[i:j] == new:
        return text
    return text[:i] + new + text[j:]


# ---------------------------------------------------------------- 导航
NAV_DESKTOP = '''    <div class="hidden items-center gap-1 lg:flex">
      <a href="#/try" class="nav-link nav-live" data-nav="try"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-mint"></span>试一试<span class="ml-1 hidden text-[9px] text-slate-600 xl:inline">含导览</span></a>
      <a href="#/features" class="nav-link" data-nav="features">方法与路径</a>
      <a href="#/library" class="nav-link" data-nav="library">笔记库</a>
      <a href="#/board" class="nav-link" data-nav="board">学习看板</a>
      <a href="#/api" class="nav-link" data-nav="api">可选增强</a>
    </div>
'''

NAV_MOBILE = '''  <div id="mobile-nav" class="hidden border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden">
    <div class="mx-auto grid max-w-6xl gap-1 px-4 py-3 sm:px-6">
      <a href="#/try" class="nav-link" data-nav="try">试一试 · 含新手导览</a>
      <a href="#/features" class="nav-link" data-nav="features">方法与路径 · 方法矩阵 + 训练路径</a>
      <a href="#/library" class="nav-link" data-nav="library">笔记库 · 检索实验室 + 全部笔记</a>
      <a href="#/board" class="nav-link" data-nav="board">学习看板</a>
      <a href="#/api" class="nav-link" data-nav="api">可选增强</a>
    </div>
  </div>
'''

# ---------------------------------------------------------------- 方法矩阵页头
FEATURES_HEAD = '''  <!-- 方法与路径 · 方法矩阵 -->
  <section id="features" data-route="features" class="py-10">
    <span class="chip reveal">METHOD MATRIX · 12 种方法 · 按证据分级</span>
    <h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">12 种学习方法，按证据强度排好队</h2>
    <p class="reveal mt-2 max-w-3xl text-sm leading-6 text-slate-400">每张卡片给出证据等级、一句话操作与最常见误用。A 级有稳定实验支持，B 级有效但依赖条件，C 级是降低摩擦的习惯设计——先做 A 级，再用 C 级保证你能坐下来做。</p>
    <div class="reveal mt-5 flex flex-wrap items-center gap-2" id="ft-filter"></div>
    <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" id="feature-grid"></div>
    <div class="panel reveal mt-6 p-5 sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-xs font-semibold text-white">目标 → 方法组合 <span class="ml-2 text-[10px] font-normal text-slate-500">单用一招效果有限，配对才有稳定收益</span></p>
        <span class="text-[10px] text-slate-600">点右侧链接直接读依据笔记</span>
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-2" id="combo-grid"></div>
    </div>
  </section>

'''

# ---------------------------------------------------------------- 笔记库上半：检索实验室
KB_SECTION = '''  <!-- 笔记库 · 检索实验室（与「全部笔记」合并为同一个导航页） -->
  <section id="knowledge" data-route="library" class="py-14">
    <span class="chip reveal">NOTE LIBRARY · 42 篇内置 · 断网可读</span>
    <h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">笔记库：一边检索，一边读全文</h2>
    <p class="reveal mt-2 max-w-3xl text-sm leading-6 text-slate-400">42 篇 / 9 类 / 约 4.8 万字学习方法笔记已在本机完成分块与 TF-IDF 向量化。这一页上半是检索实验室——输入问题就能看到命中片段、相似度与召回图谱；下半是全部笔记，可按分类或场景逐篇展开读原文。工作台里的带出处答复，走的就是同一个引擎。</p>

    <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" id="kb-overview"></div>

    <div class="mt-5 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
      <div class="panel reveal p-5">
        <p class="mb-3 flex items-center justify-between text-xs font-semibold text-white">
          内置笔记
          <span class="rounded-full bg-mint/10 px-2 py-0.5 text-[10px] text-mint" id="kb-stats"></span>
        </p>
        <div class="mb-2.5 flex flex-wrap gap-1.5" id="kb-cats"></div>
        <ul class="max-h-[420px] space-y-2 overflow-y-auto pr-1" id="kb-docs"></ul>
        <div class="mt-4 rounded-xl border border-line bg-black/20 p-3.5 text-[10.5px] leading-5 text-slate-500">
          管线：段落分块（≤420 字 / 重叠 80）→ 中文二元词（权重 1）+ 单字（权重 0.4）混合分词 + 停用词/功能字过滤 → TF-IDF 加权 → 余弦相似度 → 阈值过滤（≥ max(0.08, top×0.55)）
        </div>
      </div>
      <div class="panel reveal p-5">
        <div class="flex gap-2">
          <input id="kb-query" type="text" placeholder="例如：怎么复习效果最好？"
            class="min-w-0 flex-1 rounded-xl border border-line bg-black/30 px-3.5 py-2.5 text-[13px] text-slate-100 outline-none transition focus:border-brand/50" />
          <button onclick="runKbSearch()" class="btn-primary !px-4 !py-2 !text-xs">检索</button>
        </div>
        <div class="mt-3 flex flex-wrap gap-1.5" id="kb-presets"></div>
        <div class="mt-3 hidden flex-wrap items-center gap-1.5" id="kb-history"></div>
        <div class="mt-4 space-y-2.5" id="kb-results">
          <p class="py-8 text-center text-xs text-slate-600">输入问题或点击上方预设，查看命中片段</p>
        </div>
        <div class="mt-4 rounded-xl border border-line bg-black/20 p-3.5">
          <p class="text-[10.5px] font-semibold text-slate-300">检索没命中怎么办</p>
          <ul class="mt-1.5 space-y-1 text-[10.5px] leading-4 text-slate-500">
            <li>· 先用笔记里的术语：主动回忆、间隔重复、交错练习、认知负荷、指导消退</li>
            <li>· 或者换成「场景 + 目标」：考前两周怎么排、读完记不住怎么办、坐下就刷手机</li>
            <li>· 阈值取 max(0.08, top × 0.55)，宁可少给几条，也不塞不相关片段进来</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="panel reveal mt-5 p-5 sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-xs font-semibold text-white">按场景找笔记 <span class="ml-2 text-[10px] font-normal text-slate-500">不知道从哪篇读起时，从你当下的处境进入</span></p>
        <span class="text-[10px] text-slate-600">点任意条目直接展开全文</span>
      </div>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" id="scene-index"></div>
    </div>
  </section>

'''

# ---------------------------------------------------------------- 笔记库下半：全部笔记
LIBRARY_SECTION = '''  <!-- 全部笔记：分类浏览 + 全文阅读（完全离线） -->
  <section id="library" data-route="library" class="py-14">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="min-w-0">
        <span class="chip reveal">ALL NOTES · 按分类与场景</span>
        <h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">全部 42 篇笔记，逐篇展开读原文</h2>
        <p class="reveal mt-2 max-w-3xl text-sm leading-6 text-slate-400">每篇都按「核心概念 / 关键结论 / 操作步骤与示例 / 易错点 / 自测题」写成，末尾保留论文与专著出处。可以按分类筛、按篇幅或标题排序，也可以直接搜正文关键词。读过的篇数会记进学习看板的覆盖度。</p>
      </div>
      <div class="reveal flex flex-wrap items-center gap-2">
        <select id="lib-sort" onchange="libSort(this.value)" title="排序方式" class="rounded-xl border border-line bg-black/30 px-3 py-2 text-[11.5px] text-slate-300 outline-none">
          <option value="cat">按分类排列</option>
          <option value="len">按篇幅从长到短</option>
          <option value="title">按标题排序</option>
        </select>
      </div>
    </div>

    <div class="panel reveal mt-6 p-5 sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-xs font-semibold text-white">按分类浏览全部笔记 <span id="lib-stats" class="ml-2 font-normal text-slate-500"></span></p>
        <input id="lib-query" type="text" placeholder="搜索标题、标签或正文关键词…" oninput="libSearch(this.value)"
          class="w-full max-w-xs rounded-xl border border-line bg-black/30 px-3.5 py-2 text-[12px] text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-brand/50" />
      </div>
      <div class="mt-4 flex flex-wrap gap-1.5" id="lib-cats"></div>
      <div class="mt-5 grid gap-3 sm:grid-cols-2" id="lib-list"></div>
      <p class="mt-5 text-[10.5px] leading-5 text-slate-600">说明：笔记为中文归纳改写，供离线检索与复习参考，不替代原始论文与专著；每篇末尾保留来源出处，重要结论请对照原文。</p>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <div class="panel reveal p-5 sm:p-6" style="border-color:rgba(0,242,234,.22)">
        <span class="rounded-full bg-mint/15 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-mint">零配置 · 离线可用</span>
        <h3 class="mt-3 text-[16px] font-semibold text-white">打开就能用的学习闭环</h3>
        <ul class="mt-3 space-y-1.5 text-[12px] leading-5 text-slate-400">
          <li>✓ 42 篇方法笔记本地检索 + 抽取式问答，带 [编号] 引用与原文核对</li>
          <li>✓ 按学习目标拆阶段、排复习任务与自测卡片，写操作先确认</li>
          <li>✓ 学习任务 / 笔记 / 长期记忆 / 学习看板 / 复习时间计算</li>
          <li>✓ 语音输入与朗读、新手导览、工具清单、检索可视化</li>
          <li>✓ 出处可核对、密钥脱敏、断网与模型失败自动降级</li>
          <li>✓ 所有数据只存本机浏览器，无任何外部请求</li>
        </ul>
      </div>
      <div class="panel reveal p-5 sm:p-6" style="border-color:rgba(109,124,255,.28)">
        <span class="rounded-full bg-brand/15 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-brand-soft">配置 Key · 增强层</span>
        <h3 class="mt-3 text-[16px] font-semibold text-white">把同一批笔记讲得更贴合你</h3>
        <ul class="mt-3 space-y-1.5 text-[12px] leading-5 text-slate-400">
          <li>↑ 本地笔记片段自动注入上下文，模型基于真实方法解读而非空泛建议</li>
          <li>↑ 口语化描述、复合条件与多轮追问都能理解，例如「我总记不住公式」</li>
          <li>↑ 可结合考试日期与每日可用时长，生成完整复习计划与自测清单</li>
          <li>↑ 引用编号与前端卡片一一绑定，每条方法建议都可逐条溯源</li>
          <li>↑ 接口异常 / 断网时自动回退离线引擎，学习不中断</li>
          <li>↑ Key 只存本机 localStorage，可测试、可一键清除</li>
        </ul>
      </div>
    </div>
  </section>

'''

# ---------------------------------------------------------------- 学习看板
BOARD_SECTION = '''  <!-- 学习看板 -->
  <section id="board" data-route="board" class="py-14">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <span class="chip reveal">STUDY BOARD · 真实数据</span>
        <h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">学习看板</h2>
        <p class="reveal mt-2 max-w-2xl text-sm leading-6 text-slate-400">工作台里排下的复习任务、打卡与学习笔记会实时同步到这里。除了曲线，这一页还算未来 7 天的复习负荷、笔记库覆盖度与本周执行清单——数据只存在你的浏览器。</p>
      </div>
      <button onclick="clearLocalData()" class="btn-ghost reveal !px-3.5 !py-2 !text-xs">清空本地数据</button>
    </div>
    <div class="mt-6 grid gap-3 sm:grid-cols-4" id="board-stats"></div>
    <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" id="board-metrics"></div>
    <div class="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <div class="panel reveal scan-card p-5">
        <p class="flex items-center justify-between text-xs font-semibold text-white">学习曲线
          <span class="text-[10px] font-normal text-slate-500">近 7 天新增学习任务 / 笔记</span>
        </p>
        <div class="mt-3" id="board-curve"></div>
      </div>
      <div class="panel reveal p-5">
        <p class="mb-3 text-xs font-semibold text-white">长期记忆 <span class="ml-1 text-[10px] font-normal text-slate-500">自动记录你的学习目标</span></p>
        <div class="flex flex-wrap gap-2" id="board-memory"></div>
      </div>
    </div>
    <div class="panel reveal mt-4 p-5">
      <p class="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-white">未来 7 天复习负荷
        <span class="text-[10px] font-normal text-slate-500">按每个学习任务创建日 +1 / +3 / +7 天推算，提前知道哪天要还债</span>
      </p>
      <div class="mt-3" id="board-load"></div>
    </div>
    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <div class="panel reveal p-5">
        <p class="mb-3 flex items-center justify-between text-xs font-semibold text-white">
          学习任务
          <span class="text-[10px] font-normal text-slate-500">自然语言增删（工作台）或直接添加</span>
        </p>
        <div class="mb-3 flex gap-2">
          <input id="quick-todo-input" type="text" placeholder="直接输入学习任务，回车或点添加"
            class="min-w-0 flex-1 rounded-xl border border-line bg-black/30 px-3 py-2 text-[12px] text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-brand/50" />
          <select id="quick-todo-prio" title="优先级" class="rounded-xl border border-line bg-black/30 px-2 py-2 text-[12px] text-slate-300 outline-none">
            <option value="high">高</option>
            <option value="medium" selected>中</option>
            <option value="low">低</option>
          </select>
          <button onclick="quickAddTodo()" class="btn-primary !px-3.5 !py-2 !text-xs">添加</button>
        </div>
        <ul class="space-y-2" id="board-todos"></ul>
      </div>
      <div class="panel reveal p-5">
        <p class="mb-3 flex items-center justify-between text-xs font-semibold text-white">
          学习笔记
          <span class="text-[10px] font-normal text-slate-500">由 save_note 工具写入</span>
        </p>
        <ul class="space-y-2" id="board-notes"></ul>
      </div>
    </div>
    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <div class="panel reveal p-5">
        <p class="mb-1 text-xs font-semibold text-white">笔记库覆盖度</p>
        <p class="mb-3 text-[10.5px] text-slate-500">在笔记库里点开过的篇数 / 该分类总篇数，用来发现被忽略的主题</p>
        <div class="space-y-2.5" id="board-coverage"></div>
      </div>
      <div class="panel reveal p-5">
        <p class="mb-1 flex items-center justify-between text-xs font-semibold text-white">本周执行清单
          <span id="board-check-count" class="text-[10px] font-normal text-slate-500"></span>
        </p>
        <p class="mb-3 text-[10.5px] text-slate-500">六个动作，做到就打勾；每周一自动归零重来</p>
        <div class="space-y-2" id="board-check"></div>
      </div>
    </div>
  </section>

'''

# ---------------------------------------------------------------- 训练路径
SCENES_SECTION = '''  <!-- 训练路径 -->
  <section id="scenes" data-route="features" class="py-14">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="min-w-0">
        <span class="chip reveal">LEARNING PATHS · 六条路径 · 现场生成</span>
        <h2 class="reveal mt-4 text-2xl font-bold text-white sm:text-3xl title-serif">六条训练路径，从当下的问题出发</h2>
        <p class="reveal mt-2 max-w-2xl text-sm leading-6 text-slate-400">每条路径给出阶段拆解、逐日任务与依据笔记。可以先「展开日程」看完整安排，再「写入学习看板」变成真的任务，或让引航按你的考试日期重新排一份。</p>
      </div>
      <span class="reveal inline-flex items-center gap-1.5 rounded-full border border-glow/30 bg-glow/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-glow"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-glow"></span>LIVE 现场生成</span>
    </div>
    <div class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3" id="path-grid"></div>
    <div class="panel reveal mt-5 p-5 sm:p-6">
      <p class="text-xs font-semibold text-white">不知道选哪条？按现状对号入座</p>
      <div class="mt-4 overflow-x-auto">
        <table class="w-full min-w-[620px] text-left text-[11.5px]">
          <thead>
            <tr class="border-b border-line text-[10px] uppercase tracking-wider text-slate-500">
              <th class="pb-2 pr-3 font-medium">你现在的处境</th>
              <th class="pb-2 pr-3 font-medium">建议路径</th>
              <th class="pb-2 pr-3 font-medium">第一篇该读的笔记</th>
              <th class="pb-2 font-medium">两周后应看到</th>
            </tr>
          </thead>
          <tbody class="text-slate-400">
            <tr class="border-b border-line/60">
              <td class="py-2.5 pr-3 text-slate-300">一直在重读、划线，合上书就说不清</td>
              <td class="py-2.5 pr-3">7 天 · 主动回忆习惯</td>
              <td class="py-2.5 pr-3">主动回忆：把「看过了」变成「答得出」</td>
              <td class="py-2.5">能闭卷说出每节的三条要点</td>
            </tr>
            <tr class="border-b border-line/60">
              <td class="py-2.5 pr-3 text-slate-300">记了又忘，复习总堆在考前一晚</td>
              <td class="py-2.5 pr-3">4 周 · 间隔复习系统</td>
              <td class="py-2.5 pr-3">复习排程算法：Leitner、SM-2 到 FSRS</td>
              <td class="py-2.5">每天到期卡片 10–20 张，清得完</td>
            </tr>
            <tr class="border-b border-line/60">
              <td class="py-2.5 pr-3 text-slate-300">例题会做，换个问法就不会</td>
              <td class="py-2.5 pr-3">3 周 · 迁移与变式训练</td>
              <td class="py-2.5 pr-3">迁移与变式练习：为什么换一种题型就不会了</td>
              <td class="py-2.5">同一考点能在三种问法下作答</td>
            </tr>
            <tr class="border-b border-line/60">
              <td class="py-2.5 pr-3 text-slate-300">坐下了却总在整理桌面、刷手机</td>
              <td class="py-2.5 pr-3">2 周 · 专注力与环境改造</td>
              <td class="py-2.5 pr-3">环境设计：把干扰挡在开始之前</td>
              <td class="py-2.5">每天至少一个完整 25 分钟块</td>
            </tr>
            <tr class="border-b border-line/60">
              <td class="py-2.5 pr-3 text-slate-300">书读完了，笔记很多，从不回看</td>
              <td class="py-2.5 pr-3">3 周 · 主动阅读与笔记重构</td>
              <td class="py-2.5 pr-3">康奈尔笔记：把一页纸变成一套自测题</td>
              <td class="py-2.5">每章留下 5 道能自测的问题</td>
            </tr>
            <tr>
              <td class="py-2.5 pr-3 text-slate-300">考完感觉不错，分数却总差一截</td>
              <td class="py-2.5 pr-3">2 周 · 考前冲刺与错题收敛</td>
              <td class="py-2.5 pr-3">学习错觉：别把「熟悉」当成「会了」</td>
              <td class="py-2.5">模拟分与自评分误差缩到 10 分内</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

'''

# ---------------------------------------------------------------- 导览步骤
GUIDE_BLOCK = '''const GUIDE_STEPS = [
  { title: "新手导览", say: "这里是导览台。引航会先把你的学习目标拆成阶段，再从 42 篇方法笔记里找出依据，帮你排复习任务与自测卡片，写操作前请你确认，最后给出能核对原文出处的答复。点右侧任一步骤可自由跳转，也可以直接点「开始导览」自动播放。", target: "#guide", route: "try" },
  { title: "方法与路径", say: "这一页合并了原来的方法矩阵与训练路径：上半是 12 种方法卡，按 A / B / C 证据等级分级，每张都写了操作和常见误用；下半是六条训练路径，能展开逐日日程并一键写进看板。", target: "#features", route: "features" },
  { title: "一次提问的流程", say: "一次提问背后是四步：读懂目标 → 检索 42 篇笔记 → 拆成可执行的复习步骤 → 给出带出处的答复。往下滑可以看到完整的流程拆解。", target: "#flow", route: "features" },
  { title: "笔记库", say: "42 篇系统笔记、9 个分类、约 4.8 万字全部装在这一页里，断网也能逐篇展开阅读。上半是检索实验室，能看命中片段与召回图谱；下半按分类和场景浏览全文。", target: "#knowledge", route: "library" },
  { title: "学习看板", say: "看板会把你的学习任务、笔记、复习负荷和笔记库覆盖度放在一起：未来 7 天哪天要还债、哪类笔记还没读、本周六个动作完成几个，都在这页。", target: "#board", route: "board" },
  { title: "可选增强", say: "这一步完全可选：不填任何 Key，上面的功能已经全部可用。填了自己的 DeepSeek Key，笔记片段会自动注入模型上下文，能结合考试日期与作息生成个性化计划。Key 只存在本机浏览器。", target: "#api", route: "api" },
  { title: "开始练习", say: "最后进入工作台：输入一个真实的学习目标，看引航查笔记、排计划、请求确认并给出带出处的答复。自动播放到此步时会直接打开工作台。", target: "#top", route: "try", action: "workspace" },
];
'''

# ---------------------------------------------------------------- 路由
ROUTER_BLOCK = '''  const ROUTES = ["try", "features", "library", "board", "api"];
  const ALIAS = { guide: "try", scenes: "features", knowledge: "library" };
  const REFRESH = {
    try: () => { guideRender(true); renderTryChips(); },
    features: () => { renderFeatures(); renderPaths(); },
    library: () => { renderKb(); renderLibrary(); },
    board: renderBoard,
  };
  function routeFX(route) {
    window.__route = route;
    document.querySelectorAll("[data-route]").forEach(el => el.classList.toggle("route-on", el.dataset.route === route));
    links.forEach(a => a.classList.toggle("active", a.dataset.nav === route));
    const mn = $("mobile-nav"); if (mn) mn.classList.add("hidden");
    document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 0); document.documentElement.style.scrollBehavior = "";
    if (typeof REFRESH[route] === "function") { try { REFRESH[route](); } catch (err) { console.warn("refresh failed", route, err); } }
    document.querySelectorAll(".reveal:not(.revealed)").forEach(el => revealObserver.observe(el));
    // 兜底：滚动观察器在某些环境下不触发时，首屏内容仍要可见
    setTimeout(() => {
      document.querySelectorAll("[data-route].route-on .reveal:not(.revealed)").forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight * 0.92 && r.bottom > -40) {
          el.style.transition = "none";
          el.classList.add("revealed");
        }
      });
    }, 140);
  }
  window.gotoRoute = function (route) {
    const r = ALIAS[route] || route;
    if (!ROUTES.includes(r)) return;
    if (location.hash === "#/" + r) routeFX(r);
    else location.hash = "#/" + r;
  };
  addEventListener("hashchange", () => {
    const raw = location.hash.replace(/^#\\/?/, "");
    const r = ALIAS[raw] || raw;
    if (!ROUTES.includes(r)) return;
    if (raw !== r) history.replaceState(null, "", "#/" + r);
    routeFX(r);
  });
  const firstRaw = location.hash.replace(/^#\\/?/, "");
  const first = ALIAS[firstRaw] || firstRaw;
  if (firstRaw !== first && ROUTES.includes(first)) history.replaceState(null, "", "#/" + first);
  routeFX(ROUTES.includes(first) ? first : "try");
'''

# ---------------------------------------------------------------- 数字口径
NUM_COPY = [
    ("26 篇 / 7 类 / 约 3 万字", "42 篇 / 9 类 / 约 4.8 万字"),
    ("26 篇系统笔记、7 个分类、约 3 万字", "42 篇系统笔记、9 个分类、约 4.8 万字"),
    ("本资料库 26 篇笔记", "本资料库 42 篇笔记"),
    ("26 篇 / 7 类笔记", "42 篇 / 9 类笔记"),
    ("26 篇 / 7 类", "42 篇 / 9 类"),
    ("26 篇学习方法笔记", "42 篇学习方法笔记"),
    ("26 篇方法笔记", "42 篇方法笔记"),
    ("26 篇系统笔记", "42 篇系统笔记"),
    ("26 篇笔记", "42 篇笔记"),
    ("内置的 26 篇", "内置的 42 篇"),
    ("7 类笔记", "9 类笔记"),
    ("7 个分类", "9 个分类"),
    ("26 篇", "42 篇"),
    ("7 类", "9 类"),
]


def main():
    html = HTML.read_text(encoding="utf-8")

    # 导航
    html = splice(html, '    <div class="hidden items-center gap-1 lg:flex">', '    <div class="flex items-center gap-2">', NAV_DESKTOP)
    html = splice(html, '  <div id="mobile-nav" class="hidden border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden">', '  <div class="nav-progress" id="nav-progress"></div>', NAV_MOBILE)

    # 板块骨架
    html = splice(html, '  <!-- 能力矩阵 -->', '  <!-- 检索实验室 -->', FEATURES_HEAD)
    html = splice(html, '  <!-- 检索实验室 -->', '  <!-- 资料中心：全部文档内置、可浏览全文 -->', KB_SECTION)
    html = splice(html, '  <!-- 资料中心：全部文档内置、可浏览全文 -->', '  <!-- 效率看板 -->', LIBRARY_SECTION)
    html = splice(html, '  <!-- 效率看板 -->', '  <!-- 学习路径 -->', BOARD_SECTION)
    html = splice(html, '  <!-- 学习路径 -->', '  <!-- 工作流程 -->', SCENES_SECTION)

    # 导览与路由
    html = repl(html, '<section id="guide" data-route="guide" class="py-16">',
                '<section id="guide" data-route="try" class="py-16">')
    html = splice(html, 'const GUIDE_STEPS = [', 'let guideActive = 0', GUIDE_BLOCK)
    html = splice(html, '  const ROUTES = [', '  const onScroll = () => {', ROUTER_BLOCK)
    html = repl(html, 'else if (!/^#\\/(try|guide|features|knowledge|library|board|scenes|api)$/.test(location.hash)) {',
                'else if (!/^#\\/(try|features|library|board|api|guide|knowledge|scenes)$/.test(location.hash)) {')

    # 数字口径
    for old, new in NUM_COPY:
        html = repl(html, old, new)

    # 导览台文案里的「六步」
    html = repl(html, 'GUIDE CONSOLE · 六步上手', 'GUIDE CONSOLE · 七步上手')

    HTML.write_text(html, encoding="utf-8")
    if miss:
        print("!! 未命中 %d 条：" % len(miss))
        for m in miss:
            print("   -", m)
    else:
        print("补丁 A 完成：导航 5 项、板块骨架重排、路由别名、数字口径已更新")


if __name__ == "__main__":
    main()
