<script setup lang="ts">
import { projects } from '@/data/projects'
</script>

<template>
  <div class="projects-grid">
    <article v-for="(project, index) in projects" :key="project.id" class="project-card" :style="{ '--card-index': index }">
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
          <span class="project-stage">{{ project.stage }}</span>
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
          <span v-if="!project.links?.length" class="project-footnote"><span class="status-dot"></span>{{ project.stage }} · 持续更新</span>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.projects-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 20px; }
.project-card { min-width: 0; overflow: hidden; border: 1px solid rgba(103,136,184,.16); border-radius: 22px; background: rgba(255,255,255,.76); box-shadow: 0 16px 45px -36px rgba(43,76,128,.42); transition: transform .32s var(--ease), box-shadow .32s var(--ease), border-color .32s var(--ease); animation: card-in .55s var(--ease) both; animation-delay: calc(var(--card-index) * 70ms); }
.project-card:hover { transform: translateY(-5px); border-color: rgba(103,145,206,.36); box-shadow: 0 24px 52px -34px rgba(43,76,128,.56); }
.project-art { position: relative; display: flex; align-items: center; justify-content: center; aspect-ratio: 1.62 / 1; overflow: hidden; isolation: isolate; }
.project-art::before { content: ''; position: absolute; inset: 0; z-index: -1; background-image: radial-gradient(rgba(255,255,255,.64) .7px, transparent .7px); background-size: 17px 17px; opacity: .48; }
.project-art--tavern { color: #ecf3ff; background: linear-gradient(135deg,#111d3b,#243d67 60%,#425b85); }
.project-art--web { color: #456da8; background: linear-gradient(135deg,#edf4ff,#d5e4fb); }
.project-art--cards { color: #456da8; background: linear-gradient(135deg,#eef4ff,#ecebff 56%,#d5e4fb); }
.art-card-stack { position: absolute; inset: 0; }
.art-card { position: absolute; top: 15%; width: 30%; height: 64%; border-radius: 12px; border: 1px solid rgba(255,255,255,.92); background: linear-gradient(165deg,#ffffff,#e2ecfd); box-shadow: 0 16px 28px -20px rgba(45,76,128,.6); }
.art-card--1 { left: 23%; transform: rotate(-10deg); }
.art-card--2 { left: 35%; top: 12%; z-index: 2; }
.art-card--3 { left: 47%; transform: rotate(10deg); }
.art-card i { position: absolute; left: 50%; top: 15%; width: 44%; aspect-ratio: 1; transform: translateX(-50%); border-radius: 50%; background: linear-gradient(150deg,#cfe0fb,#e9e6ff); }
.art-card::after { content: ''; position: absolute; left: 20%; right: 20%; bottom: 20%; height: 2px; border-radius: 2px; background: rgba(69,109,168,.26); box-shadow: 0 8px 0 rgba(69,109,168,.16), 0 -8px 0 rgba(69,109,168,.16); }
.art-orbit { position: absolute; top: 5%; left: 13%; width: 72%; aspect-ratio: 1; border: 1px solid rgba(103,143,203,.26); border-radius: 50%; pointer-events: none; }
.project-art--tavern .art-orbit { top: 11%; width: 75%; border-color: rgba(220,232,255,.23); }
.project-kind { position: absolute; z-index: 2; top: 14px; left: 15px; max-width: calc(100% - 30px); color: rgba(43,73,120,.73); font-size: 9px; font-weight: 700; letter-spacing: .16em; }
.project-art--tavern .project-kind { color: rgba(228,238,255,.72); }
.art-moon { position: absolute; top: 23%; left: 36%; width: 86px; height: 86px; border-radius: 50%; background: #f7f2da; box-shadow: 0 0 36px rgba(216,226,255,.2); }
.art-moon::after { content: ''; position: absolute; top: -8px; left: 26px; width: 78px; height: 78px; border-radius: 50%; background: #243d67; }
.art-star { position: absolute; color: #e6edff; }
.art-star--one { top: 18%; left: 22%; font-size: 20px; }
.art-star--two { top: 54%; right: 20%; font-size: 28px; }
.art-window { position: absolute; bottom: -20%; left: 30%; display: flex; justify-content: space-around; gap: 6px; width: 40%; height: 48%; padding: 10px; border: 1px solid rgba(222,235,255,.4); border-radius: 48% 48% 0 0; background: linear-gradient(180deg,rgba(111,140,187,.14),rgba(6,18,43,.6)); }
.art-window i { width: 1px; height: 100%; background: rgba(222,235,255,.23); }
.art-wordmark { position: absolute; bottom: 20%; left: 16%; color: rgba(242,246,255,.94); font: 600 clamp(18px,2vw,27px)/.98 Georgia,'Times New Roman',serif; letter-spacing: .12em; text-shadow: 0 5px 24px rgba(0,0,0,.22); }
.art-window--web { top: 17%; bottom: auto; left: 18%; width: 64%; height: 64%; border: 1px solid rgba(91,127,183,.25); border-radius: 12px; background: rgba(255,255,255,.44); box-shadow: 0 16px 28px -24px rgba(45,76,128,.55); }
.art-window--web i { background: rgba(91,127,183,.24); }
.art-big-letter { position: absolute; right: 18%; bottom: 6%; color: rgba(69,109,168,.9); font: 700 clamp(60px,8vw,94px) Georgia,serif; letter-spacing: -.08em; }
.art-grid-lines { position: absolute; inset: 0; background: repeating-linear-gradient(90deg,transparent 0 33px,rgba(85,123,182,.08) 33px 34px),repeating-linear-gradient(0deg,transparent 0 33px,rgba(85,123,182,.08) 33px 34px); mask-image: linear-gradient(135deg,#000,transparent 82%); }
.project-body { padding: 19px 19px 17px; }
.project-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.project-title-row h3 { color: var(--ink); font-family: var(--font-sans); font-size: 17px; font-weight: 650; line-height: 1.45; }
.project-stage { flex: 0 0 auto; padding: 4px 8px; border-radius: 999px; color: #5a7cae; background: #edf4ff; font-size: 10px; white-space: nowrap; }
.project-body p { min-height: 66px; margin-top: 10px; color: var(--ink-2); font-size: 13px; line-height: 1.8; }
.project-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 0; padding: 0; list-style: none; }
.project-tags li { padding: 4px 8px; border: 1px solid rgba(101,132,179,.15); border-radius: 8px; color: #6a7f9e; background: rgba(242,247,255,.78); font-size: 10px; }
.project-footer { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 6px 14px; min-height: 30px; margin-top: 16px; }
.project-link { display: inline-flex; align-items: center; gap: 8px; color: var(--accent); font-size: 12px; font-weight: 650; transition: gap .2s ease; }
.project-link:hover { gap: 12px; }
.project-footnote { display: inline-flex; align-items: center; gap: 7px; color: var(--ink-3); font-size: 11px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #8bb1e8; box-shadow: 0 0 0 3px rgba(139,177,232,.16); }
@keyframes card-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 980px) { .projects-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } .project-card:last-child { grid-column: 1 / -1; } .project-card:last-child .project-art { aspect-ratio: 2.5 / 1; } }
@media (max-width: 620px) { .projects-grid { grid-template-columns: 1fr; gap: 15px; } .project-card:last-child { grid-column: auto; } .project-card:last-child .project-art { aspect-ratio: 1.62 / 1; } .project-body { padding: 17px 16px 15px; } .project-body p { min-height: auto; } }
@media (prefers-reduced-motion: reduce) { .project-card { animation: none; } }
</style>
