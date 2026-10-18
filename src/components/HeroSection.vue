<script setup lang="ts">
import { profile } from '@/data/profile'
import { artworkUri } from '@/utils/artwork'

// Hero 右侧那张抽象图：改 seed / 配色即可换一张
const heroArt = artworkUri(7, 'moss', 800, 1000)
</script>

<template>
  <section id="home" class="hero">
    <div class="container hero-inner">
      <div class="hero-copy">
        <span class="eyebrow rise">{{ profile.eyebrow }}</span>

        <h1 class="hero-name rise" style="animation-delay: 0.06s">{{ profile.name }}</h1>

        <p class="hero-tagline rise" style="animation-delay: 0.12s">{{ profile.tagline }}</p>

        <p class="hero-bio rise" style="animation-delay: 0.18s">{{ profile.bio }}</p>

        <div class="hero-actions rise" style="animation-delay: 0.24s">
          <a class="btn btn-solid" href="#gallery">看看相册</a>
          <a class="btn btn-ghost" href="#poetry">读几首诗</a>
          <a class="btn btn-ghost" href="#ai">AI 陪练</a>
        </div>

        <ul class="hero-socials rise" style="animation-delay: 0.3s">
          <li v-for="social in profile.socials" :key="social.label">
            <a :href="social.href" target="_blank" rel="noopener noreferrer">{{ social.label }}</a>
          </li>
          <li class="loc">{{ profile.location }}</li>
        </ul>
      </div>

      <div class="hero-visual rise" style="animation-delay: 0.16s">
        <div class="frame">
          <img :src="heroArt" alt="封面插图" />
        </div>
        <span class="seal" aria-hidden="true">{{ profile.initial }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: calc(var(--nav-h) + 76px) 0 100px;
  position: relative;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1.12fr 0.88fr;
  align-items: center;
  gap: 64px;
}

.hero-name {
  font-size: clamp(54px, 8.4vw, 96px);
  letter-spacing: 0.08em;
  margin: 16px 0 4px;
  line-height: 1.16;
}

.hero-name::after {
  content: '';
  display: block;
  width: 52px;
  height: 2px;
  margin-top: 22px;
  background: var(--seal);
  opacity: 0.75;
}

.hero-tagline {
  font-family: var(--font-serif);
  font-size: clamp(17px, 1.7vw, 21px);
  color: var(--ink-2);
  margin-top: 22px;
  letter-spacing: 0.04em;
}

.hero-bio {
  margin-top: 18px;
  max-width: 32em;
  font-size: 15px;
  color: var(--ink-3);
  line-height: 1.95;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.hero-socials {
  display: flex;
  align-items: center;
  gap: 20px;
  list-style: none;
  margin: 38px 0 0;
  padding: 0;
  font-size: 13.5px;
  color: var(--ink-3);
}

.hero-socials a {
  position: relative;
  transition: color 0.25s var(--ease);
}

.hero-socials a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -3px;
  width: 100%;
  height: 1px;
  background: currentColor;
  opacity: 0.28;
  transition: opacity 0.25s var(--ease);
}

.hero-socials a:hover {
  color: var(--accent);
}

.hero-socials a:hover::after {
  opacity: 1;
}

.hero-socials .loc {
  color: var(--ink-3);
  opacity: 0.8;
}

.hero-socials .loc::before {
  content: '·';
  margin-right: 20px;
  opacity: 0.5;
}

/* 右侧视觉 */
.hero-visual {
  position: relative;
  justify-self: end;
  width: 100%;
  max-width: 400px;
}

.frame {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  background: #e9e4d9;
}

.frame::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  pointer-events: none;
}

.frame img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
}

.seal {
  position: absolute;
  right: -14px;
  bottom: -14px;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  background: var(--seal);
  color: #fff8f2;
  font-family: var(--font-serif);
  font-size: 24px;
  padding-top: 2px;
  box-shadow: 0 12px 24px -12px rgba(180, 83, 58, 0.9);
  rotate: -4deg;
}

/* 入场动画 */
.rise {
  animation: rise 0.9s var(--ease) both;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 900px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 52px;
  }

  .hero-visual {
    justify-self: start;
    max-width: 300px;
  }

  .hero {
    padding: calc(var(--nav-h) + 48px) 0 72px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rise {
    animation: none;
  }
}
</style>
