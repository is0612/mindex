<script setup lang="ts">
import { profile } from '@/data/profile'

const facts = [
  { k: '坐标', v: profile.location },
  { k: '在做', v: '前端工程 / 独立写作' },
  { k: '常用', v: '相机 · 钢笔 · TypeScript' },
  { k: '近况', v: '整理第三本手抄诗集' },
]
</script>

<template>
  <section id="about" class="section">
    <div class="shell">
      <header class="head">
        <span class="head__badge">03 · 关于</span>
        <h2>About Me</h2>
        <p class="head__note">一个把代码、照片和句子混在一起存放的人。</p>
      </header>

      <div class="about">
        <div class="text card">
          <p class="text__lead">{{ profile.bio }}</p>
          <p class="text__p">
            工作里的大部分时间在跟间距、层级和边界条件打交道，剩下的时间交给句子和取景框。
            写得慢，拍得也慢，但没有停。
          </p>
          <p class="text__p">
            这个站点把三件事放在同一张桌子上：修过的界面、拍下的照片、写下的句子。
            如果你也在做类似的事，欢迎聊聊。
          </p>
        </div>

        <div class="side">
          <dl class="facts card">
            <div v-for="f in facts" :key="f.k">
              <dt>{{ f.k }}</dt>
              <dd>{{ f.v }}</dd>
            </div>
          </dl>

          <a class="ai card" href="./index.html#ai">
            <span class="ai__label">EXPERIMENT</span>
            <span class="ai__title">AI 陪练</span>
            <span class="ai__desc">练口语、练面试、练表达 —— 对面那个人，永远有耐心。</span>
            <span class="ai__go">去练一练 ↗</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
  gap: 22px;
  align-items: start;
}

.text {
  padding: 34px 36px;
}

.text__lead {
  font-size: clamp(1.15rem, 1.8vw, 1.4rem);
  font-weight: 600;
  line-height: 1.85;
  color: var(--ink);
}

.text__p {
  margin-top: 14px;
  font-size: 13.5px;
  line-height: 2;
  color: var(--ink-2);
}

.side {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.facts {
  padding: 10px 22px;
}

.facts > div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px solid rgba(65, 86, 107, 0.08);
}

.facts > div:last-child {
  border-bottom: none;
}

dt {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--ink-4);
}

dd {
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-2);
  text-align: right;
}

.ai {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 22px 24px 20px;
  transition:
    transform 0.3s var(--ease),
    box-shadow 0.3s var(--ease);
}

.ai:hover {
  transform: translateY(-3px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 34px 60px -34px rgba(30, 93, 168, 0.7);
}

.ai__label {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--ink-4);
}

.ai__title {
  font-size: 19px;
  font-weight: 600;
  color: var(--ink);
}

.ai__desc {
  font-size: 12.5px;
  line-height: 1.8;
  color: var(--ink-3);
}

.ai__go {
  margin-top: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--blue-deep);
}

@media (max-width: 900px) {
  .about {
    grid-template-columns: 1fr;
  }

  .text {
    padding: 26px 24px;
  }
}
</style>
