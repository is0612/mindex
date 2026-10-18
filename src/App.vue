<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import TheNav from '@/components/TheNav.vue'
import HeroSection from '@/components/HeroSection.vue'
import GallerySection from '@/components/GallerySection.vue'
import ModuleSection from '@/components/ModuleSection.vue'
import CoachPanel from '@/components/CoachPanel.vue'
import SiteFooter from '@/components/SiteFooter.vue'

/**
 * 诗词数据和列表单独拆成一个 chunk：
 * poems.json 有 122 KB，塞进首屏 bundle 会拖慢加载，而这部分内容在页面中段。
 */
const PoetrySection = defineAsyncComponent(() => import('@/components/PoetrySection.vue'))
</script>

<template>
  <TheNav />

  <main>
    <HeroSection />
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
      eyebrow="AI COACH"
      title="AI 陪练"
      desc="练口语、练面试、练表达 —— 对面那个人，永远有耐心。"
    >
      <CoachPanel />
    </ModuleSection>
  </main>

  <SiteFooter />
</template>
