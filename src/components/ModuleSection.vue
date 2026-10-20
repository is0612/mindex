<script setup lang="ts">
/**
 * 通用区块外壳：标题栏 + 内容插槽。
 * 默认插槽为空时显示虚线占位框，放进内容后自动变成正常版面。
 */
import { useSlots } from 'vue'
import SectionHead from '@/components/SectionHead.vue'

defineProps<{
  /** 锚点 id，导航和滚动高亮都靠它 */
  id: string
  eyebrow: string
  title: string
  desc?: string
}>()

const slots = useSlots()
</script>

<template>
  <section :id="id" class="section">
    <div class="container">
      <SectionHead v-reveal :eyebrow="eyebrow" :title="title" :desc="desc" />

      <div class="module-slot" :class="{ 'is-live': !!slots.default }" v-reveal="60">
        <slot>
          <p class="slot-title">{{ title }}待接入</p>
          <p class="slot-desc">
            内容放进这个组件的默认插槽即可，虚线框和「接入位」角标会自动消失。
          </p>
        </slot>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../styles/mixins' as *;

/* 有内容时去掉占位外观，只留间距 */
.module-slot.is-live {
  overflow: visible;
  padding: 0;
  border: 0;
  background: none;
  box-shadow: none;
  text-align: left;

  &::after {
    content: none;
  }
}
</style>
