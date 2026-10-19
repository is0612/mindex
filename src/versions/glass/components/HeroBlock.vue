<script setup lang="ts">
import { profile } from '@/data/profile'
import { coverUri } from '@/versions/shared/artwork'

const cover = coverUri(58, 'dusk', 900, 1000)

const chips = ['摄影', '写作', '界面', '前端工程']
</script>

<template>
  <section id="top" class="hero">
    <div class="shell hero__grid">
      <div class="hero__text">
        <span class="hero__hello card">你好，我是</span>

        <h1 class="hero__name">{{ profile.name }}</h1>

        <p class="hero__tagline">{{ profile.tagline }}</p>
        <p class="hero__bio">{{ profile.bio }}</p>

        <ul class="hero__chips">
          <li v-for="c in chips" :key="c">{{ c }}</li>
        </ul>

        <div class="hero__actions">
          <a class="btn" href="#works">看看作品</a>
          <a class="btn btn--ghost" :href="`mailto:${profile.email}`">写封信</a>
        </div>
      </div>

      <div class="hero__stage" v-reveal>
        <div class="hero__photo">
          <img :src="cover" alt="清晨的天空与光" width="900" height="1000" />
        </div>
        <div class="hero__float card">
          <span class="hero__float-dot" aria-hidden="true" />
          <span class="hero__float-text">现在可以接新项目</span>
        </div>
        <div class="hero__float hero__float--2 card">
          <span class="hero__float-num">2026</span>
          <span class="hero__float-sub">{{ profile.location }} · 春</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding-top: calc(var(--nav-h) + 56px);
  padding-bottom: 30px;
}

.hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
  gap: 64px;
  align-items: center;
}

.hero__hello {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 12.5px;
  color: var(--blue-deep);
  font-weight: 600;
}

.hero__name {
  margin-top: 20px;
  font-size: clamp(3.4rem, 7.5vw, 5.8rem);
  line-height: 1.04;
  letter-spacing: 0.02em;
  background: linear-gradient(120deg, var(--ink) 30%, var(--blue-deep));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero__tagline {
  margin-top: 22px;
  font-size: clamp(1.15rem, 1.8vw, 1.4rem);
  font-weight: 600;
  line-height: 1.7;
  color: var(--ink);
}

.hero__bio {
  margin-top: 12px;
  max-width: 30em;
  font-size: 14px;
  line-height: 1.95;
  color: var(--ink-2);
}

.hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 24px 0 0;
  padding: 0;
}

.hero__chips li {
  height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 0 14px;
  border-radius: 999px;
  background: var(--card-strong);
  border: 1px solid var(--card-line);
  font-size: 12px;
  color: var(--ink-2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.hero__actions {
  display: flex;
  gap: 12px;
  margin-top: 34px;
  flex-wrap: wrap;
}

/* —— 右侧照片 + 悬浮小卡 —— */
.hero__stage {
  position: relative;
}

.hero__photo {
  overflow: hidden;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 40px 80px -46px rgba(30, 93, 168, 0.75);
}

.hero__photo img {
  width: 100%;
  aspect-ratio: 9 / 10;
  object-fit: cover;
}

.hero__float {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 999px;
  left: -26px;
  bottom: 84px;
}

.hero__float-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #33c483;
  box-shadow: 0 0 0 4px rgba(51, 196, 131, 0.18);
}

.hero__float-text {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
}

.hero__float--2 {
  left: auto;
  right: -18px;
  top: 34px;
  bottom: auto;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  border-radius: 18px;
  padding: 12px 16px;
}

.hero__float-num {
  font-size: 20px;
  font-weight: 700;
  color: var(--blue-deep);
}

.hero__float-sub {
  font-size: 10.5px;
  color: var(--ink-3);
}

@media (max-width: 900px) {
  .hero {
    padding-top: calc(var(--nav-h) + 40px);
  }

  .hero__grid {
    grid-template-columns: 1fr;
    gap: 44px;
  }

  .hero__stage {
    max-width: 460px;
  }

  .hero__float {
    left: 14px;
  }

  .hero__float--2 {
    right: 14px;
  }
}

@media (max-width: 520px) {
  .hero__actions .btn {
    flex: 1;
  }

  .hero__float {
    bottom: 40px;
  }
}
</style>
