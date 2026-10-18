<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  desc?: string
}>()
</script>

<template>
  <div class="section-head">
    <span class="eyebrow">{{ eyebrow }}</span>
    <h2>{{ title }}</h2>
    <p v-if="desc">{{ desc }}</p>
  </div>
</template>
