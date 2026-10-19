<script setup lang="ts">
import { profile } from '@/data/profile'
import { coverUri } from '@/versions/shared/artwork'

const cover = coverUri(84, 'ink', 1000, 750)

const meta = [
  { k: 'PORTFOLIO', v: '2026' },
  { k: 'LOCATION', v: profile.location },
  { k: 'STATUS', v: 'OPEN FOR WORK' },
  { k: 'EDITION', v: 'V.02' },
]

const tags = ['前端工程', '摄影', '写作', '界面设计']
</script>

<template>
  <section id="top" class="hero">
    <div class="shell">
      <!-- 顶部信息条：四格，细线切分 -->
      <dl class="strip">
        <div v-for="m in meta" :key="m.k">
          <dt>{{ m.k }}</dt>
          <dd>{{ m.v }}</dd>
        </div>
      </dl>

      <h1 class="hero__name">{{ profile.name }}</h1>

      <div class="hero__cols">
        <div class="hero__text">
          <p class="hero__tagline">{{ profile.tagline }}</p>
          <p class="hero__bio">{{ profile.bio }}</p>

          <ul class="hero__tags">
            <li v-for="t in tags" :key="t">{{ t }}</li>
          </ul>

          <div class="hero__actions">
            <a class="btn" href="#works">查看作品</a>
            <a class="btn btn--ghost" :href="`mailto:${profile.email}`">写信联系</a>
          </div>
        </div>

        <figure class="hero__figure" v-reveal>
          <img :src="cover" alt="灰调抽象画面" width="1000" height="750" />
          <figcaption>FIG.01 — {{ profile.location }} / 2026</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding-top: var(--nav-h);
}

/* —— 信息条 —— */
.strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0;
  border-bottom: 1px solid var(--rule);
}

.strip > div {
  padding: 12px 16px 12px 0;
  border-right: 1px solid var(--hair);
}

.strip > div:last-child {
  border-right: none;
}

.strip dt {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: var(--gray-2);
}

.strip dd {
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* —— 名字：占满整行，贴住栅格 —— */
.hero__name {
  font-size: clamp(5rem, 16vw, 15rem);
  line-height: 0.9;
  letter-spacing: -0.03em;
  margin: 8px 0 0 -0.04em;
}

.hero__cols {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
  gap: 64px;
  padding: 40px 0 0;
}

.hero__tagline {
  font-size: clamp(1.15rem, 1.9vw, 1.5rem);
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: -0.01em;
  max-width: 20em;
}

.hero__bio {
  margin-top: 16px;
  max-width: 30em;
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--gray);
}

.hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  list-style: none;
  margin: 26px 0 0;
  padding: 0;
  border-top: 1px solid var(--hair);
}

.hero__tags li {
  padding: 8px 16px 8px 0;
  margin-right: 16px;
  border-bottom: 1px solid var(--hair);
  font-size: 11.5px;
  letter-spacing: 0.06em;
  color: var(--gray);
}

.hero__actions {
  display: flex;
  gap: 10px;
  margin-top: 32px;
}

/* —— 图：灰度处理，贴合黑白体系 —— */
.hero__figure {
  margin: 0;
  align-self: start;
}

.hero__figure img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  filter: grayscale(1) contrast(1.05);
}

.hero__figure figcaption {
  margin-top: 8px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--gray-2);
}

@media (max-width: 900px) {
  .hero__cols {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .strip {
    grid-template-columns: repeat(2, 1fr);
  }

  .strip > div:nth-child(2n) {
    border-right: none;
  }

  .strip > div {
    border-bottom: 1px solid var(--hair);
  }
}

@media (max-width: 520px) {
  .hero__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero__actions .btn {
    justify-content: center;
  }
}
</style>
