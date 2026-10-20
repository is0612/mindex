<script setup lang="ts">
import { projects } from '@/data/projects'

/** 阶段标签按语义上色：在线跑 = 绿，设计中 = 琥珀，其余用主色 */
function stageTone(stage: string): string {
  if (stage.includes('在线')) return 'is-live'
  if (stage.includes('设计')) return 'is-wip'
  return ''
}
</script>

<template>
  <div class="projects-grid">
    <article
      v-for="(project, index) in projects"
      :key="project.id"
      class="project-card"
      :style="{ '--card-index': index }"
    >
      <div class="project-art" :class="`project-art--${project.visual}`">
        <div class="art-orbit" aria-hidden="true"></div>
        <template v-if="project.visual === 'tavern'">
          <span class="art-moon" aria-hidden="true"></span>
          <span class="art-star art-star--one" aria-hidden="true">✦</span>
          <span class="art-star art-star--two" aria-hidden="true">✧</span>
          <div class="art-window" aria-hidden="true"><i></i><i></i><i></i></div>
          <span class="art-wordmark">NOCTURNE<br />TAVERN</span>
        </template>
        <template v-else-if="project.visual === 'cards'">
          <div class="art-card-stack" aria-hidden="true">
            <span class="art-card art-card--1"><i></i></span>
            <span class="art-card art-card--2"><i></i></span>
            <span class="art-card art-card--3"><i></i></span>
          </div>
        </template>
        <template v-else>
          <div class="art-window art-window--web" aria-hidden="true"><i></i><i></i><i></i></div>
          <span class="art-big-letter">M.</span>
          <span class="art-grid-lines" aria-hidden="true"></span>
        </template>
        <span class="project-kind">{{ project.subtitle }}</span>
      </div>

      <div class="project-body">
        <div class="project-title-row">
          <h3>{{ project.title }}</h3>
          <span class="project-stage" :class="stageTone(project.stage)">{{ project.stage }}</span>
        </div>
        <p>{{ project.description }}</p>
        <ul class="project-tags" aria-label="项目标签">
          <li v-for="tag in project.tags" :key="tag">{{ tag }}</li>
        </ul>
        <div class="project-footer">
          <a
            v-for="link in project.links"
            :key="link.href"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            class="project-link"
          >
            {{ link.label }} <span aria-hidden="true">↗</span>
          </a>
          <span v-if="!project.links?.length" class="project-footnote">
            <span class="status-dot" aria-hidden="true"></span>{{ project.stage }} · 持续更新
          </span>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/mixins' as *;

.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;

  @include mq(xl) {
    gap: 18px;
  }

  @include mq(lg) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    .project-card:last-child {
      grid-column: 1 / -1;

      .project-art {
        aspect-ratio: 2.5 / 1;
      }
    }
  }

  @include mq(md) {
    grid-template-columns: 1fr;
    gap: 15px;

    .project-card:last-child {
      grid-column: auto;

      .project-art {
        aspect-ratio: 1.62 / 1;
      }
    }
  }
}

.project-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(103, 136, 184, 0.16);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 16px 45px -36px rgba(43, 76, 128, 0.42);
  animation: card-in 0.55s var(--ease) both;
  animation-delay: calc(var(--card-index) * 70ms);
  // 用 translate 抬升：入场动画的 transform 会一直覆盖 hover 的 transform
  transition:
    translate 0.32s var(--ease),
    box-shadow 0.32s var(--ease),
    border-color 0.32s var(--ease);

  &:hover,
  &:focus-within {
    translate: 0 -5px;
    border-color: rgba(103, 145, 206, 0.36);
    box-shadow: 0 26px 54px -34px rgba(43, 76, 128, 0.56);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

// ---------- 纯 CSS 封面 ----------
.project-art {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1.62 / 1;
  overflow: hidden;
  isolation: isolate;

  // 细点阵底
  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.64) 0.7px, transparent 0.7px);
    background-size: 17px 17px;
    opacity: 0.48;
  }

  // 悬停时扫过的一道高光
  &::after {
    content: '';
    position: absolute;
    z-index: 3;
    inset: 0;
    background: linear-gradient(105deg, transparent 38%, rgba(255, 255, 255, 0.34) 50%, transparent 62%);
    translate: -120% 0;
    transition: translate 0.85s var(--ease);
    pointer-events: none;
  }

  &--tavern {
    background: linear-gradient(135deg, #111d3b, #243d67 60%, #425b85);
    color: #ecf3ff;
  }

  &--web {
    background: linear-gradient(135deg, #edf4ff, #d5e4fb);
    color: #456da8;
  }

  &--cards {
    background: linear-gradient(135deg, #eef4ff, #ecebff 56%, #d5e4fb);
    color: #456da8;
  }
}

.project-card:hover .project-art::after {
  translate: 120% 0;
}

.art-card-stack {
  position: absolute;
  inset: 0;
}

.art-card {
  position: absolute;
  top: 15%;
  width: 30%;
  height: 64%;
  border: 1px solid rgba(255, 255, 255, 0.92);
  border-radius: 12px;
  background: linear-gradient(165deg, #fff, #e2ecfd);
  box-shadow: 0 16px 28px -20px rgba(45, 76, 128, 0.6);

  &--1 {
    left: 23%;
    transform: rotate(-10deg);
  }

  &--2 {
    top: 12%;
    left: 35%;
    z-index: 2;
  }

  &--3 {
    left: 47%;
    transform: rotate(10deg);
  }

  i {
    position: absolute;
    top: 15%;
    left: 50%;
    width: 44%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: linear-gradient(150deg, #cfe0fb, #e9e6ff);
    transform: translateX(-50%);
  }

  &::after {
    content: '';
    position: absolute;
    right: 20%;
    bottom: 20%;
    left: 20%;
    height: 2px;
    border-radius: 2px;
    background: rgba(69, 109, 168, 0.26);
    box-shadow:
      0 8px 0 rgba(69, 109, 168, 0.16),
      0 -8px 0 rgba(69, 109, 168, 0.16);
  }
}

.art-orbit {
  position: absolute;
  top: 5%;
  left: 13%;
  width: 72%;
  border: 1px solid rgba(103, 143, 203, 0.26);
  border-radius: 50%;
  pointer-events: none;
  aspect-ratio: 1;

  .project-art--tavern & {
    top: 11%;
    width: 75%;
    border-color: rgba(220, 232, 255, 0.23);
  }
}

.project-kind {
  position: absolute;
  z-index: 2;
  top: 14px;
  left: 15px;
  max-width: calc(100% - 30px);
  color: rgba(43, 73, 120, 0.73);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.16em;

  .project-art--tavern & {
    color: rgba(228, 238, 255, 0.72);
  }
}

.art-moon {
  position: absolute;
  top: 23%;
  left: 36%;
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: #f7f2da;
  box-shadow: 0 0 36px rgba(216, 226, 255, 0.2);

  &::after {
    content: '';
    position: absolute;
    top: -8px;
    left: 26px;
    width: 78px;
    height: 78px;
    border-radius: 50%;
    background: #243d67;
  }
}

.art-star {
  position: absolute;
  color: #e6edff;

  &--one {
    top: 18%;
    left: 22%;
    font-size: 20px;
  }

  &--two {
    top: 54%;
    right: 20%;
    font-size: 28px;
  }
}

.art-window {
  position: absolute;
  bottom: -20%;
  left: 30%;
  display: flex;
  justify-content: space-around;
  gap: 6px;
  width: 40%;
  height: 48%;
  padding: 10px;
  border: 1px solid rgba(222, 235, 255, 0.4);
  border-radius: 48% 48% 0 0;
  background: linear-gradient(180deg, rgba(111, 140, 187, 0.14), rgba(6, 18, 43, 0.6));

  i {
    width: 1px;
    height: 100%;
    background: rgba(222, 235, 255, 0.23);
  }

  &--web {
    top: 17%;
    bottom: auto;
    left: 18%;
    width: 64%;
    height: 64%;
    border: 1px solid rgba(91, 127, 183, 0.25);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.44);
    box-shadow: 0 16px 28px -24px rgba(45, 76, 128, 0.55);

    i {
      background: rgba(91, 127, 183, 0.24);
    }
  }
}

.art-wordmark {
  position: absolute;
  bottom: 20%;
  left: 16%;
  color: rgba(242, 246, 255, 0.94);
  font: 600 clamp(18px, 2vw, 27px) / 0.98 Georgia, 'Times New Roman', serif;
  letter-spacing: 0.12em;
  text-shadow: 0 5px 24px rgba(0, 0, 0, 0.22);
}

.art-big-letter {
  position: absolute;
  right: 18%;
  bottom: 6%;
  color: rgba(69, 109, 168, 0.9);
  font: 700 clamp(60px, 8vw, 94px) Georgia, serif;
  letter-spacing: -0.08em;
}

.art-grid-lines {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(90deg, transparent 0 33px, rgba(85, 123, 182, 0.08) 33px 34px),
    repeating-linear-gradient(0deg, transparent 0 33px, rgba(85, 123, 182, 0.08) 33px 34px);
  mask-image: linear-gradient(135deg, #000, transparent 82%);
  -webkit-mask-image: linear-gradient(135deg, #000, transparent 82%);
}

// ---------- 正文 ----------
.project-body {
  padding: 19px 19px 17px;

  p {
    min-height: 66px;
    margin-top: 10px;
    color: var(--ink-2);
    font-size: 13px;
    line-height: 1.8;
  }

  @include mq(md) {
    padding: 17px 16px 15px;

    p {
      min-height: auto;
    }
  }
}

.project-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;

  h3 {
    color: var(--ink);
    font-family: var(--font-sans);
    font-size: 17px;
    font-weight: 650;
    line-height: 1.45;
  }
}

.project-stage {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--accent-wash);
  color: var(--accent);
  font-size: 10.5px;
  letter-spacing: 0.02em;
  white-space: nowrap;

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.75;
  }

  &.is-live {
    background: var(--good-wash);
    color: var(--good);
  }

  &.is-wip {
    background: var(--warn-wash);
    color: var(--warn);
  }
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;

  li {
    padding: 4px 8px;
    border: 1px solid rgba(101, 132, 179, 0.15);
    border-radius: 8px;
    background: rgba(242, 247, 255, 0.78);
    color: var(--ink-3);
    font-size: 10.5px;
  }
}

.project-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 6px 14px;
  min-height: 30px;
  margin-top: 16px;
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--accent);
  font-size: 12.5px;
  font-weight: 650;
  transition: gap 0.2s var(--ease);

  span {
    transition: translate 0.2s var(--ease);
  }

  &:hover {
    gap: 9px;

    span {
      translate: 2px -2px;
    }
  }

  @include focus-ring(2px);
}

.project-footnote {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--ink-3);
  font-size: 11px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-3);
  box-shadow: 0 0 0 3px rgba(139, 177, 232, 0.16);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
