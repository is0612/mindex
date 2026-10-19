<script setup lang="ts">
import { profile } from '@/data/profile'

const facts = [
  { k: 'LOCATION', v: `${profile.location}, CN` },
  { k: 'FOCUS', v: '前端工程 / 独立写作' },
  { k: 'TOOLS', v: '相机 / 钢笔 / TypeScript' },
  { k: 'NOW', v: '整理第三本手抄诗集' },
  { k: 'STATUS', v: '开放合作' },
]
</script>

<template>
  <section id="about" class="section">
    <div class="shell">
      <header class="head">
        <span class="head__no">03</span>
        <h2>关于</h2>
        <span class="head__en">ABOUT</span>
        <p class="head__note">一个把代码、照片和句子混在一起存放的人。</p>
      </header>

      <div class="about">
        <div class="about__text">
          <p class="about__lead">{{ profile.bio }}</p>
          <p>
            工作里的大部分时间在跟间距、层级和边界条件打交道，剩下的时间交给句子和取景框。
            写得慢，拍得也慢，但没有停。
          </p>
          <p>
            这个站点把三件事放在同一张桌子上：修过的界面、拍下的照片、写下的句子。
            用尽量少的颜色和清楚的层级排好顺序。
          </p>
        </div>

        <dl class="about__facts">
          <div v-for="f in facts" :key="f.k">
            <dt>{{ f.k }}</dt>
            <dd>{{ f.v }}</dd>
          </div>
        </dl>
      </div>

      <p class="about__quote">
        把日常写成可以回看的东西<i aria-hidden="true">.</i>
      </p>

      <a class="about__ai" href="./index.html#ai">
        <span class="about__ai-label">EXPERIMENT</span>
        <span class="about__ai-title">AI 陪练 →</span>
        <span class="about__ai-desc">练口语、练面试、练表达 —— 对面那个人，永远有耐心。</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.about {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
  gap: 64px;
  padding-bottom: 56px;
}

.about__lead {
  font-size: clamp(1.2rem, 2vw, 1.55rem);
  font-weight: 700;
  line-height: 1.6;
  letter-spacing: -0.01em;
}

.about__text p + p {
  margin-top: 14px;
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--gray);
}

.about__facts {
  margin: 0;
  border-top: 1px solid var(--rule);
}

.about__facts > div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 11px 4px;
  border-bottom: 1px solid var(--hair);
}

dt {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--gray-2);
}

dd {
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
  text-align: right;
}

/* —— 大字引文 —— */
.about__quote {
  margin: 0;
  padding: 44px 0;
  border-top: 1px solid var(--rule);
  font-size: clamp(1.8rem, 4.4vw, 3.4rem);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.25;
}

.about__quote i {
  color: var(--red);
  font-style: normal;
}

/* —— AI 入口：整行反色 hover —— */
.about__ai {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) minmax(0, 1.4fr);
  align-items: center;
  gap: 20px;
  padding: 18px 20px;
  border: 1px solid var(--rule);
  transition:
    background var(--fast),
    color var(--fast);
}

.about__ai-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.24em;
  color: var(--gray-2);
}

.about__ai-title {
  font-size: 16px;
  font-weight: 700;
}

.about__ai-desc {
  font-size: 12px;
  color: var(--gray);
}

.about__ai:hover {
  background: var(--ink);
  color: var(--white);
}

.about__ai:hover .about__ai-label {
  color: var(--red);
}

.about__ai:hover .about__ai-desc {
  color: rgba(255, 255, 255, 0.65);
}

@media (max-width: 900px) {
  .about {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .about__ai {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
