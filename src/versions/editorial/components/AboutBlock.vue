<script setup lang="ts">
import { profile } from '@/data/profile'

const facts = [
  { k: '坐标', v: `${profile.location}，城西` },
  { k: '在做', v: '前端工程 / 独立写作' },
  { k: '常用', v: '定焦相机 / 钢笔 / TypeScript' },
  { k: '近况', v: '整理第三本手抄诗集' },
]
</script>

<template>
  <section id="about" class="section">
    <div class="shell">
      <header class="sec-head">
        <div class="sec-head__left">
          <span class="sec-head__no">第三章</span>
          <h2>关于</h2>
          <span class="sec-head__en">About</span>
        </div>
        <p class="sec-head__note">一个把代码、照片和句子混在一起存放的人。</p>
      </header>

      <div class="about">
        <div class="about__body">
          <p class="about__drop">{{ profile.bio }}</p>
          <p>
            工作里的大部分时间在跟间距、层级和边界条件打交道，剩下的时间交给句子和取景框。
            写得慢，拍得也慢，但没有停。
          </p>
          <p>
            这个站点把三件事放在同一张桌子上：修过的界面、拍下的照片、写下的句子。
            用尽量少的颜色和清楚的层级排好顺序 —— 如果你也在做类似的事，欢迎来信。
          </p>

          <blockquote>把日常写成可以回看的东西。</blockquote>
        </div>

        <aside class="about__side">
          <dl>
            <div v-for="f in facts" :key="f.k">
              <dt>{{ f.k }}</dt>
              <dd>{{ f.v }}</dd>
            </div>
          </dl>

          <a class="note" href="./index.html#ai">
            <span class="note__label">另有一处</span>
            <span class="note__title">AI 陪练</span>
            <span class="note__desc">练口语、练面试、练表达 —— 对面那个人，永远有耐心。</span>
            <span class="note__go">去练一练 ↗</span>
          </a>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
  gap: 72px;
}

.about__body {
  max-width: 40em;
}

/* 首字下沉，是纸质刊物最经济的一个"设计动作" */
.about__drop::first-letter {
  float: left;
  margin: 6px 12px 0 0;
  font-family: var(--font-serif);
  font-size: 3.4em;
  line-height: 0.86;
  color: var(--accent);
}

.about__drop {
  font-family: var(--font-serif);
  font-size: clamp(1.1rem, 1.6vw, 1.28rem);
  line-height: 2.05;
  letter-spacing: 0.03em;
}

.about__body p + p {
  margin-top: 16px;
  font-size: 13.5px;
  line-height: 2.05;
  color: var(--ink-2);
}

blockquote {
  margin: 44px 0 0;
  padding: 4px 0 4px 24px;
  border-left: 1px solid var(--line-strong);
  font-family: var(--font-serif);
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  color: var(--ink-2);
}

/* —— 右侧旁注 —— */
.about__side dl {
  margin: 0;
  border-top: 1px solid var(--line);
}

.about__side dl > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
}

dt {
  font-size: 9.5px;
  letter-spacing: 0.22em;
  color: var(--ink-4);
}

dd {
  margin: 0;
  font-size: 12.5px;
  color: var(--ink-2);
}

.note {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 26px;
  padding: 18px 18px 16px;
  border: 1px solid var(--line);
  background: var(--paper-2);
  transition:
    border-color 0.3s var(--ease),
    background 0.3s var(--ease);
}

.note:hover {
  border-color: var(--line-strong);
  background: #fffdf7;
}

.note__label {
  font-size: 9.5px;
  letter-spacing: 0.22em;
  color: var(--ink-4);
}

.note__title {
  font-family: var(--font-serif);
  font-size: 17px;
  letter-spacing: 0.06em;
}

.note__desc {
  font-size: 12px;
  line-height: 1.85;
  color: var(--ink-3);
}

.note__go {
  margin-top: 6px;
  font-size: 11.5px;
  color: var(--seal);
}

@media (max-width: 900px) {
  .about {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .about__side {
    max-width: 420px;
  }
}
</style>
