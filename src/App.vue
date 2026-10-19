<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import TheNav from '@/components/TheNav.vue'
import HeroSection from '@/components/HeroSection.vue'
import ProjectsSection from '@/components/ProjectsSection.vue'
import GallerySection from '@/components/GallerySection.vue'
import ModuleSection from '@/components/ModuleSection.vue'
import CoachPanel from '@/components/CoachPanel.vue'
import SiteFooter from '@/components/SiteFooter.vue'

// Keep poetry in its own async chunk: it is content-rich but below the fold.
const PoetrySection = defineAsyncComponent(() => import('@/components/PoetrySection.vue'))
</script>

<template>
  <TheNav />
  <main>
    <HeroSection />

    <ModuleSection
      id="projects"
      eyebrow="SELECTED WORKS"
      title="正在构筑的世界"
      desc="从软件和 AI 体验，到角色与视觉创作。记录灵感落地的过程。"
    >
      <ProjectsSection />
    </ModuleSection>

    <GallerySection />

    <ModuleSection
      id="poetry"
      eyebrow="POETRY"
      title="个人诗词"
      desc="平仄之间，记一点心绪。点开读全文，键盘左右键也能翻。"
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
