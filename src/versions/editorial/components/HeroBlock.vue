<script setup lang="ts">
import { profile } from '@/data/profile'
import { coverUri } from '@/versions/shared/artwork'

const cover = coverUri(84, 'sand', 900, 1200)
</script>

<template>
  <section id="top" class="hero">
    <div class="shell">
      <!-- 顶部一行：刊头信息 -->
      <div class="hero__masthead">
        <span>作品集 · 二〇二六</span>
        <span class="hero__masthead-mid">{{ profile.location }}，晴</span>
        <span>第一卷</span>
      </div>

      <div class="hero__grid">
        <div class="hero__text">
          <h1 class="hero__name">{{ profile.name }}</h1>
          <p class="hero__latin">SHEN YAN</p>

          <p class="hero__tagline">{{ profile.tagline }}</p>
          <p class="hero__bio">{{ profile.bio }}</p>

          <div class="hero__actions">
            <a class="btn" href="#works">
              看作品
              <span aria-hidden="true">↓</span>
            </a>
            <a class="btn btn--seal" :href="`mailto:${profile.email}`">
              来信
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <figure class="hero__figure" v-reveal>
          <div class="hero__plate">
            <img :src="cover" alt="雾色的山与水面" width="900" height="1200" />
          </div>
          <figcaption>
            <span>图一 · 雾散之前</span>
            <span>{{ profile.location }} / 二〇二六年春</span>
          </figcaption>
        </figure>
      </div>

      <div class="hero__foot">
        <span class="hero__foot-note">向下读 · 共四章</span>
        <span class="hero__foot-rule" aria-hidden="true" />
        <span class="hero__foot-note">写作 / 摄影 / 界面</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding-top: calc(var(--nav-h) + 56px);
  padding-bottom: 64px;
}

/* —— 刊头 —— */
.hero__masthead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line-strong);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink-3);
}

.hero__masthead-mid {
  color: var(--ink-4);
}

/* —— 主体：7 : 4 —— */
.hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
  gap: 72px;
  padding-top: 48px;
}

.hero__name {
  font-size: clamp(4.6rem, 12.5vw, 10.5rem);
  line-height: 0.92;
  letter-spacing: 0.08em;
  margin-left: -0.06em;
}

.hero__latin {
  margin-top: 18px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.42em;
  color: var(--ink-4);
}

.hero__tagline {
  margin-top: 44px;
  max-width: 22em;
  font-family: var(--font-serif);
  font-size: clamp(1.15rem, 1.8vw, 1.38rem);
  line-height: 1.95;
  letter-spacing: 0.04em;
}

.hero__bio {
  margin-top: 18px;
  max-width: 26em;
  font-size: 13.5px;
  line-height: 2.05;
  color: var(--ink-2);
}

.hero__actions {
  display: flex;
  gap: 12px;
  margin-top: 40px;
}

/* —— 图版：纸边 + 图注 —— */
.hero__figure {
  margin: 0;
  align-self: start;
}

.hero__plate {
  padding: 10px;
  background: var(--paper-2);
  border: 1px solid var(--line);
  box-shadow: 0 18px 40px -38px rgba(33, 28, 22, 0.7);
}

.hero__plate img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  filter: saturate(0.92);
}

.hero__figure figcaption {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  color: var(--ink-4);
}

/* —— 页脚小行 —— */
.hero__foot {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 72px;
}

.hero__foot-rule {
  flex: 1;
  height: 1px;
  background: var(--line);
}

.hero__foot-note {
  font-size: 10.5px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-4);
  white-space: nowrap;
}

@media (max-width: 980px) {
  .hero__grid {
    grid-template-columns: 1fr;
    gap: 44px;
  }

  .hero__figure {
    max-width: 420px;
  }

  .hero__foot {
    margin-top: 44px;
  }
}

@media (max-width: 620px) {
  .hero {
    padding-top: calc(var(--nav-h) + 32px);
  }

  .hero__masthead-mid {
    display: none;
  }

  .hero__tagline {
    margin-top: 32px;
  }

  .hero__actions {
    margin-top: 30px;
  }

  .hero__actions .btn {
    flex: 1;
  }

  .hero__figure figcaption {
    flex-direction: column;
    gap: 2px;
  }
}
</style>
