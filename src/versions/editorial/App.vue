<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import SiteNav from './components/SiteNav.vue'
import HeroBlock from './components/HeroBlock.vue'
import WorksBlock from './components/WorksBlock.vue'
import AboutBlock from './components/AboutBlock.vue'
import ContactBlock from './components/ContactBlock.vue'
import VersionSwitch from '@/versions/shared/VersionSwitch.vue'

/** 诗词数据单独切包，首屏不必等 */
const PoemsBlock = defineAsyncComponent(() => import('./components/PoemsBlock.vue'))
</script>

<template>
  <SiteNav />
  <main>
    <HeroBlock />
    <WorksBlock />
    <PoemsBlock />
    <AboutBlock />
    <ContactBlock />
  </main>
  <VersionSwitch current="editorial" />
</template>
