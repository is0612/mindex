<script setup lang="ts">
import { profile } from '@/data/profile'

const base = import.meta.env.BASE_URL
const heroArt = `${base}photos/catgirl-hero.png`
const heroArtWebp = `${base}photos/catgirl-hero.webp`
</script>

<template>
  <section id="home" class="hero" aria-labelledby="hero-title">
    <div class="container hero-inner">
      <div class="hero-copy">
        <span class="eyebrow rise">{{ profile.eyebrow }}</span>
        <h1 id="hero-title" class="hero-name rise" style="animation-delay: 0.06s">{{ profile.name }}</h1>
        <p class="hero-tagline rise" style="animation-delay: 0.12s">{{ profile.tagline }}</p>
        <p class="hero-bio rise" style="animation-delay: 0.18s">{{ profile.bio }}</p>

        <div class="hero-actions rise" style="animation-delay: 0.24s">
          <a class="btn btn-solid" href="#projects">浏览项目 <span aria-hidden="true">↗</span></a>
          <a class="btn btn-ghost" href="#poetry">读几句诗</a>
          <a class="btn btn-ghost" href="#ai">AI 陪练</a>
        </div>

        <ul class="hero-socials rise" style="animation-delay: 0.3s" aria-label="联系方式">
          <li v-for="social in profile.socials" :key="social.label">
            <a :href="social.href" target="_blank" rel="noopener noreferrer">
              {{ social.label }} <span aria-hidden="true">↗</span>
            </a>
          </li>
          <li class="loc">{{ profile.location }}</li>
        </ul>
      </div>

      <div class="hero-visual rise" style="animation-delay: 0.16s">
        <div class="hero-orbit hero-orbit--one" aria-hidden="true"></div>
        <div class="hero-orbit hero-orbit--two" aria-hidden="true"></div>

        <div class="character-frame">
          <picture>
            <source :srcset="heroArtWebp" type="image/webp" />
            <img
              :src="heroArt"
              width="520"
              height="780"
              alt="蓝白猫娘角色立绘，微笑挥手欢迎访客"
              fetchpriority="high"
              decoding="async"
            />
          </picture>
        </div>

        <div class="hero-note" aria-hidden="true">
          <span class="note-star">✦</span>
          <span class="note-copy"><strong>陪你探索</strong><small>Projects · Ideas · Stories</small></span>
        </div>
        <span class="hero-star" aria-hidden="true">✧</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../styles/mixins' as *;

.hero {
  position: relative;
  isolation: isolate;
  padding-block: calc(var(--nav-h) + 60px) 78px;

  // 右侧一团冷光
  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: 0 0 0 auto;
    width: min(62vw, 800px);
    background: radial-gradient(ellipse at 68% 35%, rgba(173, 202, 246, 0.34), transparent 66%);
    pointer-events: none;
  }

  // 细点阵，只在视觉区附近透出来
  &::after {
    content: '';
    position: absolute;
    z-index: -1;
    inset: 0;
    background-image: radial-gradient(rgba(88, 132, 196, 0.16) 1px, transparent 1px);
    background-size: 22px 22px;
    mask-image: radial-gradient(58% 58% at 68% 42%, #000 0%, transparent 76%);
    -webkit-mask-image: radial-gradient(58% 58% at 68% 42%, #000 0%, transparent 76%);
    opacity: 0.55;
    pointer-events: none;
  }

  @include mq(lg) {
    padding-block: calc(var(--nav-h) + 44px) 64px;
  }
}

.hero-inner {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  align-items: center;
  gap: clamp(28px, 5vw, 72px);

  @include mq(lg) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.hero-copy {
  min-width: 0;

  @include mq(lg) {
    max-width: 680px;
  }
}

.hero-name {
  margin: 14px 0 4px;
  color: var(--ink);
  font-size: clamp(52px, 7.4vw, 86px);
  letter-spacing: 0.04em;
  line-height: 1.14;
  text-wrap: balance;

  // 名字下面一道从深蓝到浅蓝的短横
  &::after {
    content: '';
    display: block;
    width: 58px;
    height: 3px;
    margin-top: 22px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--accent), #a5c5f6);
  }

  @include mq(sm) {
    font-size: clamp(46px, 14vw, 66px);

    &::after {
      margin-top: 18px;
    }
  }
}

.hero-tagline {
  margin-top: 22px;
  color: var(--ink-2);
  font-family: var(--font-serif);
  font-size: clamp(17px, 1.7vw, 21px);
  letter-spacing: 0.025em;
  text-wrap: pretty;

  @include mq(md) {
    margin-top: 18px;
  }
}

.hero-bio {
  max-width: 34em;
  margin-top: 16px;
  color: var(--ink-2);
  font-size: 15px;
  line-height: 1.95;
  opacity: 0.92;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 30px;

  @include mq(sm) {
    gap: 8px;

    :deep(.btn) {
      padding: 9px 16px;
      font-size: 13px;
    }
  }
}

.hero-socials {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
  margin: 30px 0 0;
  padding: 0;
  color: var(--ink-3);
  font-size: 13px;
  list-style: none;

  a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding-bottom: 1px;
    border-bottom: 1px solid rgba(70, 109, 168, 0.28);
    transition:
      color var(--dur) var(--ease),
      border-color var(--dur) var(--ease);

    span {
      font-size: 11px;
      transition: translate var(--dur) var(--ease);
    }

    &:hover {
      border-color: var(--accent);
      color: var(--accent);

      span {
        translate: 2px -2px;
      }
    }

    @include focus-ring(2px);
  }

  .loc {
    display: inline-flex;
    align-items: center;
    opacity: 0.85;

    &::before {
      content: '';
      width: 4px;
      height: 4px;
      margin-right: 18px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.6;
    }
  }

  @include mq(sm) {
    gap: 12px;
    margin-top: 24px;
    font-size: 12px;

    .loc::before {
      margin-right: 12px;
    }
  }
}

// ---------- 立绘区 ----------
.hero-visual {
  position: relative;
  isolation: isolate;
  justify-self: end;
  width: 100%;
  max-width: 430px;

  @include mq(lg) {
    justify-self: center;
    max-width: 340px;
    margin-top: 2px;
  }

  @include mq(sm) {
    max-width: min(84vw, 315px);
  }
}

.hero-orbit {
  position: absolute;
  z-index: -1;
  border: 1px solid rgba(104, 143, 205, 0.18);
  border-radius: 50%;
  pointer-events: none;

  &--one {
    top: 4%;
    left: 2%;
    width: 91%;
    border-style: dashed;
    aspect-ratio: 1;
  }

  &--two {
    top: 11%;
    left: 9%;
    width: 78%;
    border-color: rgba(139, 174, 226, 0.15);
    aspect-ratio: 1;
  }
}

.character-frame {
  width: 100%;
  animation: character-float 6s ease-in-out infinite;

  picture {
    display: block;
    width: 100%;
  }

  img {
    width: 100%;
    height: auto;
    aspect-ratio: 2 / 3;
    object-fit: contain;
    filter: drop-shadow(0 18px 22px rgba(48, 77, 126, 0.12));
  }
}

.hero-note {
  position: absolute;
  z-index: 3;
  bottom: 15%;
  left: -24px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 17px 12px 12px;
  border: 1px solid rgba(255, 255, 255, 0.92);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 14px 38px -24px rgba(40, 75, 130, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  @include mq(lg) {
    left: -8px;
    bottom: 13%;
  }

  @include mq(sm) {
    left: -12px;
    padding: 9px 12px 9px 9px;
  }
}

.note-star {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: linear-gradient(145deg, #9fc0f1, #557db9);
  color: #fff;
  font-size: 18px;

  @include mq(sm) {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }
}

.note-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;

  strong {
    color: var(--ink);
    font-size: 12.5px;
    font-weight: 650;
  }

  small {
    color: var(--ink-3);
    font-size: 10px;
    letter-spacing: 0.06em;
  }
}

.hero-star {
  position: absolute;
  top: 10%;
  right: 0;
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  background: linear-gradient(145deg, #7fa5df, #466aab);
  box-shadow: 0 8px 24px -12px rgba(56, 88, 146, 0.75);
  color: #fff;
  rotate: 8deg;
}

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

@keyframes character-float {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: 0 -7px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rise,
  .character-frame {
    animation: none;
  }
}
</style>
