# 个人主页

Vue 3 + TypeScript + Vite，纯静态、零外部依赖（不加载任何 CDN 字体或图片）。AI 陪练面板只在你点击时才会连一次你自己配的模型接口。

> 构建产物**不能**直接双击 `index.html` 打开：浏览器不允许 `file://` 加载 ES module，会白屏。用 `npm run dev` 或 `npm run preview` 起一个本地服务器。
>
> `vite.config.ts` 里设了 `base: './'`，所以 `dist/` 放到根目录、子目录（比如 GitHub Pages 的 `/仓库名/`）都能正常加载资源。

## 开发

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物在 dist/
npm run preview  # 本地预览 dist
```

## 目录

```
src/
├── data/
│   ├── profile.ts        # 名字、简介、社交链接、邮箱 ← 先改这里
│   ├── poems.json        # 诗词正文（条目由管理页增删）
│   ├── poems.ts          # 诗词排序 / 年份 / 首句等纯函数
│   └── coach.ts          # AI 陪练：提示词、场景、接口调用 ← 改这里
├── stores/poetry.ts      # 诗词数据源（文件 / 浏览器 / 内置 三层兜底 + 增删改）
├── pages/PoetryManage.vue# 诗词管理页：#/poems，全部诗词的查改增删
├── composables/useHashRoute.ts # 极简 hash 路由（首页 / 管理页）
├── directives/reveal.ts  # v-reveal 滚动渐显指令
├── components/
│   ├── TheNav.vue        # 顶部导航（滚动变毛玻璃 + 当前区块高亮）
│   ├── HeroSection.vue   # 首屏
│   ├── ModuleSection.vue # 通用区块外壳：标题 + 插槽，插槽为空时显示占位框
│   ├── FilterTabs.vue    # 胶囊筛选栏（诗词按年份用）
│   ├── PoetrySection.vue # 诗词：今日一首 / 年份筛选 / 列表（按需加载的独立 chunk）
│   ├── PoemDialog.vue    # 诗词全文弹层（Teleport 到 body）
│   ├── CoachPanel.vue    # AI 陪练面板：开始 / 对话 / 复盘
│   ├── SectionHead.vue   # 标题栏
│   └── SiteFooter.vue
├── style.css             # 设计变量 + 全局样式
└── App.vue
public/
└── photos/               # 首屏立绘（catgirl-hero.png）
```

## 四件常改的事

**1. 改名字和信息** —— `src/data/profile.ts`，同时记得改 `index.html` 里的 `<title>`。

**2. 诗词（已接入 + 可视化后台）**

- 数据在 `src/data/poems.json`，200+ 首，2010–2026，字段是 `id / title / genre / date / volumeNo / body`。
- **管理页**：首页诗词板块底部「查看全部 N 首 · 管理诗词」，或直接访问 `#/poems`。里面能搜标题/正文/体裁、按年份和体裁筛、分页，单首或批量删除、新增、编辑、导入导出 JSON、恢复初始数据。删除后有 7 秒撤销。
- **改动存哪儿**（`src/stores/poetry.ts` 里的三层兜底）：
  - `npm run dev` 下：`vite.config.ts` 里的 `poems-file-api` 中间件提供 `GET/PUT /api/poems`，管理页的改动**直接写回 `src/data/poems.json`**，重新 build 后线上生效。因为写了 `server.watch.ignored`，保存时不会整页刷新。
  - 静态部署（`dist/`）下没有后端：改动只存在浏览器 `localStorage`（`mindex:poems:v1`），顶部会标「浏览器本地」。这时用「导出 JSON」覆盖 `src/data/poems.json` 才会永久保存。
  - 什么都没改过：直接用构建时打包的初始数据。
- **加一首诗**：以前要手改 JSON，现在去管理页点「新增」；`body` 在表单里一行一句，写完什么样页面上就什么样。
- **改展示**：`PoetrySection.vue`。第一屏是「今日一首」（同一天永远是同一首，`poemOfDay()` 按日期取模）；下面按年份筛选、每页 9 首。诗词板块和后台共用 `stores/poetry.ts` 的同一份 `poems`，所以后台删掉的诗，回到首页立刻消失。
- **排版由内容决定，不由代码猜**：`data/poems.ts` 只做 `linesOf()`——正文 `body` 数组里怎么分行，页面就怎么分行，不做断句、不合并、不竖排。词的上下阕之间在数据里放一个空串 `""`，页面渲染成一整行空白。
  - 现有 218 首已经按下面这套规则烘进 `poems.json`（脚本一次性跑过，之后不再自动改）：
    - **词牌** —— 一句一排，上下阕之间空一行。
    - **五七言绝句**（4 句）—— 一句一排。
    - **律诗及更长**（句数成双、各句长短整齐）—— 两句一排，一联一行。
    - **自由分行**（现代诗）—— 原样保留。
  - 想改哪一首的排版，直接去管理页编辑它的正文，或在 `poems.json` 里改 `body`；页面不再有第二套逻辑。
  - 今日一首和弹窗都是整首完整显示，不截断；超过 8 行才在底部标「共 N 行」。
- **全文弹窗**：`PoemDialog.vue` 高度固定（`min(82vh, 660px)`），标题和「上一首 / 下一首」位置不动，切换诗词时只有中间内容区换，不会整块弹窗忽高忽低；一屏放得下 15 行（够多数双调词），更长的在中间区域内部滚动。Esc 关闭、← → 翻页，`<Teleport to="body">` 挂在 body 上——诗词区外层有 `v-reveal`，它的 `transform` 会把 `position: fixed` 锁在区块里，不 Teleport 就盖不住导航。
- **隐私**：原始数据里每条带 `source`（QQ 空间链接，含号码），导入时已经去掉，`poems.json` 里没有外链。

**3. AI 陪练（已接入）**

面板在 `CoachPanel.vue`，提示词和接口在 `data/coach.ts`。

- **它怎么工作**：你输入「跟领导请假」→ 模型直接以领导身份开口 → 你回 5~8 轮 → 点「结束并复盘」→ 模型逐句给出「你原话 / 改成 / 为什么」。
- **两次独立请求**：陪练用 `ROLE_PROMPT`，复盘用 `REVIEW_PROMPT`，复盘走的是干净上下文。**不要把它们合成一次调用**，否则模型会被刚才的角色人格带软，讲评会变成「你做得挺好，不过……」。
- **复盘要的是 json**：`REVIEW_PROMPT` 要求模型只输出 json，接口带 `response_format: json_object`，`parseReview()` 负责解析；解析失败会原样显示文本，不会白屏。
- **Key 怎么来**：页面右上角「设置」里填，存在 `localStorage`（`mindex.coach.settings.v1`），**不写进代码**。这是公开站点，任何写进源码的 key 等于泄露。
- **没有 Key 的人**：点「复制提示词」把 `ROLE_PROMPT` 复制走，粘到 DeepSeek 网页版一样能练，只是复盘得另开一个对话。
- **换模型**：`设置` 里的 Base URL 和模型名都能改，任何 OpenAI 兼容接口都行（Kimi、通义、本地 Ollama 等）。下拉里给的是 `deepseek-flash`（日常够用、便宜）和 `deepseek-v4-pro`（复盘更准、贵不少）。
- **思考模式**：DeepSeek 现在默认开思考模式，陪练时每句话都要先想十几秒，而且思考模式下 `temperature` 不生效。所以代码里分成两种调用：陪练 `thinking: disabled` + `temperature: 1.1`；复盘 `thinking: enabled` + `reasoning_effort: high`（复盘只有一次，值得让它想清楚）。这两个参数只在 `deepseek.com` 域名下才发，换别家不会因为多出字段报错。
- **旧设置自动迁移**：以前存过 `deepseek-chat` / `deepseek-reasoner` 的，`loadSettings()` 会把它们映射成 `deepseek-flash`，不用手动改。
- **改场景**：`PRESETS` 数组就是首页那排胶囊按钮，想改成自己的高频场景直接改这里。

一点限制：`fetch` 需要页面跑在 http(s) 下。直接双击 `dist/index.html` 打开时，浏览器可能拦截接口请求——这时「复制提示词」仍然可用。

**4. 加一个新模块**

每个大区块都是 `ModuleSection`，标题、锚点、占位都由它统一处理：

```vue
<ModuleSection id="notes" eyebrow="NOTES" title="随手记" desc="一句话说明这个区块。">
  <NotesList />
</ModuleSection>
```

`id` 会自动成为导航锚点（导航高亮靠它）。插槽为空时显示虚线占位框，放进内容后自动变成正常版面——不会再出现重复的 `<section id>`。

## 设计说明

- 配色：暖米白底 + 松墨绿主色 + 朱砂点缀，标题走宋体，正文走系统黑体
- 动效：`v-reveal` 进入视口淡入上浮，`v-reveal="120"` 可加延迟做错落
- 所有动画都遵守 `prefers-reduced-motion`
- 代码分割：首屏只加载项目和陪练，诗词（含全部诗词数据）用 `defineAsyncComponent` 拆成独立 chunk，主包因此从 234 KB 降到 111 KB
