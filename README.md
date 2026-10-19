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
│   ├── photos.ts         # 照片类型 + 取图地址（数据在 public/photos.json）
│   ├── gallery.ts        # 运行时加载相册数据与分类
│   ├── poems.json        # 诗词正文（条目由管理页增删）
│   ├── poems.ts          # 诗词排序 / 年份 / 首句等纯函数
│   └── coach.ts          # AI 陪练：提示词、场景、接口调用 ← 改这里
├── stores/poetry.ts      # 诗词数据源（文件 / 浏览器 / 内置 三层兜底 + 增删改）
├── pages/PoetryManage.vue# 诗词管理页：#/poems，全部诗词的查改增删
├── composables/useHashRoute.ts # 极简 hash 路由（首页 / 管理页）
├── utils/artwork.ts      # 程序化生成占位封面（没有真图时用）
├── directives/reveal.ts  # v-reveal 滚动渐显指令
├── components/
│   ├── TheNav.vue        # 顶部导航（滚动变毛玻璃 + 当前区块高亮）
│   ├── HeroSection.vue   # 首屏
│   ├── GallerySection.vue# 相册（分类筛选 + 灯箱）
│   ├── PhotoLightbox.vue # 灯箱（键盘 ← → Esc、手机左右滑）
│   ├── ModuleSection.vue # 通用区块外壳：标题 + 插槽，插槽为空时显示占位框
│   ├── FilterTabs.vue    # 胶囊筛选栏（相册按分类、诗词按年份共用）
│   ├── PoetrySection.vue # 诗词：今日一首 / 年份筛选 / 列表（按需加载的独立 chunk）
│   ├── PoemDialog.vue    # 诗词全文弹层（Teleport 到 body）
│   ├── CoachPanel.vue    # AI 陪练面板：开始 / 对话 / 复盘
│   ├── SectionHead.vue   # 标题栏
│   └── SiteFooter.vue
├── style.css             # 设计变量 + 全局样式
└── App.vue
public/
├── photos.json           # 相册照片数据 ← 加照片改这里
├── albums.json           # 相册分类与顺序 ← 加分类改这里
└── photos/               # 真实照片放这里
```

## 五件常改的事

**1. 改名字和信息** —— `src/data/profile.ts`，同时记得改 `index.html` 里的 `<title>`。

**2. 换照片 / 加分类（改 JSON 即可，不用动代码）**

相册数据是运行时从 `public/` 读取的，改完 push 就生效，不需要改 Vue、也不需要重新构建：

- **加一张照片**：图片放进 `public/photos/`，然后在 `public/photos.json` 里加一条

  ```json
  { "id": "p13", "title": "暴雨前的云", "category": "风景", "date": "2026.08",
    "seed": 151, "palette": "mist", "src": "photos/storm.webp" }
  ```

  `src` 留空会自动生成同色系的抽象封面兜底，所以可以先建条目、后换图。
  `src` 填完整的 `https://` 地址也可以（图片放在图床/对象存储时）。

- **加一个分类**：在 `public/albums.json` 里加一条

  ```json
  { "id": "travel", "name": "旅行", "order": 4, "visible": true }
  ```

  `name` 要和照片的 `category` 一致；`order` 决定筛选栏顺序；`visible: false` 会让这个分类
  不在筛选栏出现（照片本身仍可通过链接访问，属于「不列出」而非「加密」）。
  没在 `albums.json` 里登记的分类会自动追加到筛选栏末尾，不会被吞掉。

- 图片尺寸：长边 1600px 以内、WebP 或质量 80 的 JPEG、单张 300KB 以内。
  git 会永久保留历史，别把相机原图直接提交。
- 注意：`yarn preview` 读的是 `dist/`，改了 `public/` 要重新 `yarn build`；`yarn dev` 实时生效。

**3. 诗词（已接入 + 可视化后台）**

- 数据在 `src/data/poems.json`，200+ 首，2010–2026，字段是 `id / title / genre / date / volumeNo / body`。
- **管理页**：首页诗词板块底部「查看全部 N 首 · 管理诗词」，或直接访问 `#/poems`。里面能搜标题/正文/体裁、按年份和体裁筛、分页，单首或批量删除、新增、编辑、导入导出 JSON、恢复初始数据。删除后有 7 秒撤销。
- **改动存哪儿**（`src/stores/poetry.ts` 里的三层兜底）：
  - `npm run dev` 下：`vite.config.ts` 里的 `poems-file-api` 中间件提供 `GET/PUT /api/poems`，管理页的改动**直接写回 `src/data/poems.json`**，重新 build 后线上生效。因为写了 `server.watch.ignored`，保存时不会整页刷新。
  - 静态部署（`dist/`）下没有后端：改动只存在浏览器 `localStorage`（`mindex:poems:v1`），顶部会标「浏览器本地」。这时用「导出 JSON」覆盖 `src/data/poems.json` 才会永久保存。
  - 什么都没改过：直接用构建时打包的初始数据。
- **加一首诗**：以前要手改 JSON，现在去管理页点「新增」；`body` 在表单里一行一句，空行自动去掉。
- **改展示**：`PoetrySection.vue`。第一屏是「今日一首」（同一天永远是同一首，`poemOfDay()` 按日期取模）；下面按年份筛选、每页 9 首。诗词板块和后台共用 `stores/poetry.ts` 的同一份 `poems`，所以后台删掉的诗，回到首页立刻消失。
- **排版按体裁走**：判定在 `data/poems.ts` 的 `poemLayout()`，三处（今日一首、全文弹窗）共用同一套规则。
  - **竖排**（`writing-mode: vertical-rl`，一句一列、从右往左）只给句式整齐的律绝古体：体裁不是词、标题不带「·」、不超过 8 句、最长一句不超过 9 字。竖排时会去掉句末标点，纯文字排出来更像古籍。
  - **横排**：词牌一律横排（长短句竖排会被切断），句数多或一句十几个字的古体也横排，逐句居中、长句自己折行。
  - 竖排里 `line-height` 控制的是**列宽**、`letter-spacing` 是字距，和横排正好反过来；列间距用 `p + p { margin-left }`，首尾不留白才能真居中。
- **全文弹窗**：`PoemDialog.vue` 高度固定（`min(80vh, 620px)`），标题和「上一首 / 下一首」位置不动，切换诗词时只有中间内容区换，不会整块弹窗忽高忽低；内容超长时在中间区域内部滚动。Esc 关闭、← → 翻页，`<Teleport to="body">` 挂在 body 上——诗词区外层有 `v-reveal`，它的 `transform` 会把 `position: fixed` 锁在区块里，不 Teleport 就盖不住导航。
- **隐私**：原始数据里每条带 `source`（QQ 空间链接，含号码），导入时已经去掉，`poems.json` 里没有外链。

**4. AI 陪练（已接入）**

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

**5. 加一个新模块**

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
- 相册网格固定 4:5，换图不用管尺寸，`object-fit: cover` 会裁好
- 代码分割：首屏只加载相册和陪练，诗词（含全部诗词数据）用 `defineAsyncComponent` 拆成独立 chunk，主包因此从 234 KB 降到 111 KB
