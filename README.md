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
│   ├── photos.ts         # 相册数据 ← 换照片改这里
│   └── coach.ts          # AI 陪练：提示词、场景、接口调用 ← 改这里
├── utils/artwork.ts      # 程序化生成占位封面（没有真图时用）
├── directives/reveal.ts  # v-reveal 滚动渐显指令
├── components/
│   ├── TheNav.vue        # 顶部导航（滚动变毛玻璃 + 当前区块高亮）
│   ├── HeroSection.vue   # 首屏
│   ├── GallerySection.vue# 相册（已完成：分类筛选 + 灯箱）
│   ├── PhotoLightbox.vue # 灯箱（键盘 ← → Esc、手机左右滑）
│   ├── PoetrySlot.vue    # 个人诗词 —— 留白占位
│   ├── AiCoachSlot.vue   # AI 陪练区块（已接入 CoachPanel）
│   ├── CoachPanel.vue    # AI 陪练面板：开始 / 对话 / 复盘
│   ├── SectionHead.vue   # 标题栏
│   └── SiteFooter.vue
├── style.css             # 设计变量 + 全局样式
└── App.vue
public/
└── photos/               # 真实照片放这里
```

## 三件常改的事

**1. 改名字和信息** —— `src/data/profile.ts`，同时记得改 `index.html` 里的 `<title>`。

**2. 换成自己的照片**
1. 图片放进 `public/photos/`（jpg / webp，长边 1600px 以内就够）
2. 在 `src/data/photos.ts` 里给每项补 `src: 'photos/文件名.jpg'`
3. `category` 写什么词，页面上的筛选按钮就自动多一个

留空 `src` 也不会开天窗——会自动生成一张同色系的抽象封面兜底。

**3. 接入诗词**

诗词模块还留着插槽，两种接法任选一种：

```vue
<!-- 方式一：内容从外部传进去，占位装饰自动让位 -->
<PoetrySlot>
  <PoetryList />
</PoetrySlot>
```

```vue
<!-- 方式二：直接把内容粘进 .module-slot，删掉 .placeholder 那一段 -->
<!-- 外层的间距和宽度不要动 -->
```

如果模块需要固定高度，给 `PoetrySlot.vue` 里的 `.module-slot` 加 `min-height`。

**4. AI 陪练（已接入）**

面板在 `CoachPanel.vue`，提示词和接口在 `data/coach.ts`。

- **它怎么工作**：你输入「跟领导请假」→ 模型直接以领导身份开口 → 你回 5~8 轮 → 点「结束并复盘」→ 模型逐句给出「你原话 / 改成 / 为什么」。
- **两次独立请求**：陪练用 `ROLE_PROMPT`，复盘用 `REVIEW_PROMPT`，复盘走的是干净上下文。**不要把它们合成一次调用**，否则模型会被刚才的角色人格带软，讲评会变成「你做得挺好，不过……」。
- **复盘要的是 json**：`REVIEW_PROMPT` 要求模型只输出 json，接口带 `response_format: json_object`，`parseReview()` 负责解析；解析失败会原样显示文本，不会白屏。
- **Key 怎么来**：页面右上角「设置」里填，存在 `localStorage`（`mindex.coach.settings.v1`），**不写进代码**。这是公开站点，任何写进源码的 key 等于泄露。
- **没有 Key 的人**：点「复制提示词」把 `ROLE_PROMPT` 复制走，粘到 DeepSeek 网页版一样能练，只是复盘得另开一个对话。
- **换模型**：`设置` 里的 Base URL 和模型名都能改，任何 OpenAI 兼容接口都行（Kimi、通义、本地 Ollama 等）。
- **改场景**：`PRESETS` 数组就是首页那排胶囊按钮，想改成自己的高频场景直接改这里。

一点限制：`fetch` 需要页面跑在 http(s) 下。直接双击 `dist/index.html` 打开时，浏览器可能拦掉接口请求——这时「复制提示词」仍然可用。

## 设计说明

- 配色：暖米白底 + 松墨绿主色 + 朱砂点缀，标题走宋体，正文走系统黑体
- 动效：`v-reveal` 进入视口淡入上浮，`v-reveal="120"` 可加延迟做错落
- 所有动画都遵守 `prefers-reduced-motion`
- 相册网格固定 4:5，换图不用管尺寸，`object-fit: cover` 会裁好
