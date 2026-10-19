<script setup lang="ts">
import { profile } from '@/data/profile'

const heroArt = `${import.meta.env.BASE_URL}photos/catgirl-hero.png`
</script>

<template>
  <section id="home" class="hero">
    <div class="container hero-inner">
      <div class="hero-copy">
        <span class="eyebrow rise">{{ profile.eyebrow }}</span>
        <h1 class="hero-name rise" style="animation-delay: .06s">{{ profile.name }}</h1>
        <p class="hero-tagline rise" style="animation-delay: .12s">{{ profile.tagline }}</p>
        <p class="hero-bio rise" style="animation-delay: .18s">{{ profile.bio }}</p>

        <div class="hero-actions rise" style="animation-delay: .24s">
          <a class="btn btn-solid" href="#projects">浏览项目 <span aria-hidden="true">↗</span></a>
          <a class="btn btn-ghost" href="#gallery">看看相册</a>
          <a class="btn btn-ghost" href="#ai">AI 陪练</a>
        </div>

        <ul class="hero-socials rise" style="animation-delay: .3s">
          <li v-for="social in profile.socials" :key="social.label">
            <a :href="social.href" target="_blank" rel="noopener noreferrer">{{ social.label }}</a>
          </li>
          <li class="loc">{{ profile.location }}</li>
        </ul>
      </div>

      <div class="hero-visual rise" style="animation-delay: .16s">
        <div class="hero-orbit hero-orbit--one" aria-hidden="true"></div>
        <div class="hero-orbit hero-orbit--two" aria-hidden="true"></div>
        <div class="character-frame">
          <img :src="heroArt" alt="蓝白猫娘角色立绘，微笑挥手欢迎访客" fetchpriority="high" />
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

<style scoped>
.hero { position: relative; isolation: isolate; padding: calc(var(--nav-h) + 58px) 0 62px; }
.hero::before { content: ''; position: absolute; z-index: -1; inset: 0 0 0 auto; width: min(60vw, 780px); background: radial-gradient(ellipse at 68% 35%, rgba(173, 202, 246, .34), transparent 66%); pointer-events: none; }
.hero-inner { display: grid; grid-template-columns: 1.08fr .92fr; align-items: center; gap: clamp(28px, 5vw, 72px); }
.hero-copy { min-width: 0; }
.hero-name { margin: 14px 0 4px; color: var(--ink); font-size: clamp(52px, 7.5vw, 88px); letter-spacing: .045em; line-height: 1.16; }
.hero-name::after { content: ''; display: block; width: 58px; height: 3px; margin-top: 22px; border-radius: 999px; background: linear-gradient(90deg, var(--accent), #a5c5f6); }
.hero-tagline { margin-top: 22px; color: var(--ink-2); font-family: var(--font-serif); font-size: clamp(17px, 1.7vw, 21px); letter-spacing: .025em; }
.hero-bio { max-width: 34em; margin-top: 18px; color: var(--ink-3); font-size: 15px; line-height: 1.95; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 30px; }
.hero-socials { display: flex; align-items: center; flex-wrap: wrap; gap: 18px; margin: 32px 0 0; padding: 0; list-style: none; color: var(--ink-3); font-size: 13px; }
.hero-socials a { border-bottom: 1px solid rgba(70,109,168,.25); transition: color .2s ease, border-color .2s ease; }
.hero-socials a:hover { color: var(--accent); border-color: var(--accent); }
.hero-socials .loc { opacity: .8; }
.hero-socials .loc::before { content: '·'; margin-right: 18px; }
.hero-visual { position: relative; justify-self: end; width: 100%; max-width: 430px; isolation: isolate; }
.hero-orbit { position: absolute; z-index: -1; border: 1px solid rgba(104,143,205,.18); border-radius: 50%; pointer-events: none; }
.hero-orbit--one { top: 4%; left: 2%; width: 91%; aspect-ratio: 1; border-style: dashed; animation: orbit-spin 48s linear infinite; }
.hero-orbit--two { top: 11%; left: 9%; width: 78%; aspect-ratio: 1; border-color: rgba(139,174,226,.15); }
.character-frame { width: 100%; animation: character-float 6s ease-in-out infinite; }
.character-frame img { width: 100%; aspect-ratio: 2 / 3; object-fit: contain; filter: drop-shadow(0 18px 22px rgba(48,77,126,.12)); }
.hero-note { position: absolute; z-index: 3; left: -24px; bottom: 15%; display: flex; align-items: center; gap: 11px; padding: 12px 17px 12px 12px; border: 1px solid rgba(255,255,255,.92); border-radius: 17px; background: rgba(255,255,255,.78); box-shadow: 0 14px 38px -24px rgba(40,75,130,.5); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
.note-star { display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto; border-radius: 12px; color: #fff; background: linear-gradient(145deg,#9fc0f1,#557db9); font-size: 18px; }
.note-copy { display: flex; flex-direction: column; gap: 1px; }
.note-copy strong { color: var(--ink); font-size: 12.5px; font-weight: 650; }
.note-copy small { color: var(--ink-3); font-size: 9px; letter-spacing: .06em; }
.hero-star { position: absolute; top: 10%; right: 0; display: grid; place-items: center; width: 39px; height: 39px; border: 1px solid rgba(255,255,255,.8); border-radius: 50%; color: #fff; background: linear-gradient(145deg,#7fa5df,#466aab); box-shadow: 0 8px 24px -12px rgba(56,88,146,.75); rotate: 8deg; }
.rise { animation: rise .9s var(--ease) both; }
@keyframes rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes character-float { 0%,100% { translate: 0 0; } 50% { translate: 0 -7px; } }
@keyframes orbit-spin { to { rotate: 360deg; } }
@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; gap: 24px; }
  .hero-copy { max-width: 680px; }
  .hero-visual { justify-self: center; max-width: 340px; margin-top: 2px; }
  .hero { padding: calc(var(--nav-h) + 42px) 0 64px; }
  .hero-note { left: -8px; bottom: 13%; }
}
@media (max-width: 520px) {
  .hero-name { font-size: clamp(48px,14vw,68px); }
  .hero-actions { gap: 8px; }
  .hero-actions :deep(.btn) { padding: 10px 16px; font-size: 13px; }
  .hero-socials { gap: 13px; font-size: 12px; }
  .hero-visual { max-width: min(84vw,315px); }
  .hero-note { left: -12px; padding: 9px 12px 9px 9px; }
  .note-star { width: 30px; height: 30px; }
}
@media (prefers-reduced-motion: reduce) {
  .rise, .character-frame, .hero-orbit--one { animation: none; }
}
</style>
