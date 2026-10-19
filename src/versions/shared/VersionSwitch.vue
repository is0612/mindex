<script setup lang="ts">
/**
 * 三版对比用的版本切换器。
 * 刻意用中性黑白，不掺进任何一版的配色里。
 */
const current = defineProps<{ current: 'editorial' | 'swiss' | 'glass' }>()

const items = [
  { id: 'editorial', no: '01', label: '编辑杂志', href: './home-editorial.html' },
  { id: 'swiss', no: '02', label: '瑞士极简', href: './home-swiss.html' },
  { id: 'glass', no: '03', label: '轻盈玻璃', href: './home-glass.html' },
] as const
</script>

<template>
  <nav class="vs" aria-label="切换设计方案">
    <a
      v-for="item in items"
      :key="item.id"
      :href="item.href"
      class="vs__item"
      :class="{ 'is-on': current.current === item.id }"
      :aria-current="current.current === item.id ? 'page' : undefined"
    >
      <span class="vs__no">{{ item.no }}</span>
      <span class="vs__label">{{ item.label }}</span>
    </a>
  </nav>
</template>

<style scoped>
.vs {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 300;
  display: flex;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 10px 30px -18px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.vs__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-family: 'Segoe UI', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 11.5px;
  color: #4a4a4a;
  text-decoration: none;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.vs__no {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  opacity: 0.55;
}

.vs__item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.vs__item.is-on {
  background: #111;
  color: #fff;
}

.vs__item.is-on .vs__no {
  opacity: 0.7;
}

@media (max-width: 620px) {
  .vs {
    right: 12px;
    bottom: 12px;
  }

  .vs__item {
    padding: 0 10px;
  }

  .vs__label {
    display: none;
  }
}
</style>
