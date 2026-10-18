<script setup lang="ts">
import TheNav from '@/components/TheNav.vue'
import HeroSection from '@/components/HeroSection.vue'
import GallerySection from '@/components/GallerySection.vue'
import PoetrySlot from '@/components/PoetrySlot.vue'
import PoetrySection from '@/components/PoetrySection.vue'
import AiCoachSlot from '@/components/AiCoachSlot.vue'
import CoachPanel from '@/components/CoachPanel.vue'
import SiteFooter from '@/components/SiteFooter.vue'
</script>

<template>
  <TheNav />

  <main>
    <HeroSection />
    <GallerySection />

    <!-- 诗词：接入位在 PoetrySlot.vue 里 -->
    <PoetrySlot>
      <PoetrySection />
    </PoetrySlot>

    <!-- AI 陪练：接入位在 AiCoachSlot.vue 里 -->
    <AiCoachSlot>
      <CoachPanel />
    </AiCoachSlot>
  </main>

  <SiteFooter />
</template>
