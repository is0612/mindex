<script setup lang="ts">
import { defineAsyncComponent, nextTick, watch } from 'vue'
import TheNav from '@/components/TheNav.vue'
import HeroSection from '@/components/HeroSection.vue'
import ProjectsSection from '@/components/ProjectsSection.vue'
import ModuleSection from '@/components/ModuleSection.vue'
import CoachPanel from '@/components/CoachPanel.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { useHashRoute } from '@/composables/useHashRoute'

// Keep poetry in its own async chunk: it is content-rich but below the fold.
const PoetrySection = defineAsyncComponent(() => import('@/components/PoetrySection.vue'))
const PoetryManage = defineAsyncComponent(() => import('@/pages/PoetryManage.vue'))

const { route } = useHashRoute()

// 从管理页返回时，等首页挂载完再滚到锚点
watch(route, async (next, prev) => {
  if (next !== 'home' || prev === 'home') return
  await nextTick()
  const id = window.location.hash.slice(1)
  if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' })
})
</script>

<template>
  <template v-if="route === 'home'">
    <a class="skip-link" href="#main">跳到正文</a>
    <TheNav />
    <main id="main">
      <HeroSection />

      <ModuleSection
        id="projects"
        eyebrow="SELECTED WORKS"
        title="正在构筑的世界"
        desc="从软件和 AI 体验，到角色与视觉创作。记录灵感落地的过程。"
      >
        <ProjectsSection />
      </ModuleSection>

      <ModuleSection
        id="poetry"
        eyebrow="POETRY"
        title="个人诗词"
        desc="平仄之间，记一点心绪。点开读全文，键盘左右键也能翻；写多了去管理页删改。"
      >
        <PoetrySection />
      </ModuleSection>

      <ModuleSection
        id="ai"
        eyebrow="AI COMPANION"
        title="AI 陪练"
        desc="练口语、练面试、练表达 —— 对面那个人，永远有耐心。"
      >
        <CoachPanel />
      </ModuleSection>
    </main>
    <SiteFooter />
  </template>

  <PoetryManage v-else />
</template>
