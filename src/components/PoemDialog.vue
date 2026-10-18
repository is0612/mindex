<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Poem } from '@/data/poems'
import { formatDate } from '@/data/poems'

const props = defineProps<{
  poem: Poem
  list: Poem[]
}>()

const emit = defineEmits<{
  'update:poem': [poem: Poem]
  close: []
}>()

const idx = computed(() => props.list.findIndex((p) => p.id === props.poem.id))
const hasPrev = computed(() => idx.value > 0)
const hasNext = computed(() => idx.value >= 0 && idx.value < props.list.length - 1)

function step(delta: number) {
  const target = props.list[idx.value + delta]
  if (target) emit('update:poem', target)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowLeft') step(-1)
  else if (e.key === 'ArrowRight') step(1)
}

let prevOverflow = ''

onMounted(() => {
  window.addEventListener('keydown', onKey)
  prevOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = prevOverflow
})

const sheetEl = ref<HTMLElement | null>(null)

// 换诗时把内容区滚回顶部，读下一首不该停在上一首的末尾
watch(
  () => props.poem.id,
  () => {
    sheetEl.value?.scrollTo({ top: 0 })
  },
)
</script>

<template>
  <!-- 挂到 body：外层 .reveal 的 transform 会把 fixed 定位锁在区块里 -->
  <Teleport to="body">
    <div class="mask" role="dialog" aria-modal="true" :aria-label="poem.title" @click.self="emit('close')">
      <article ref="sheetEl" class="poem-sheet">
        <button class="close" type="button" aria-label="关闭" @click="emit('close')">×</button>

        <header class="head">
          <h3 class="title">{{ poem.title }}</h3>
          <p class="meta">
            <span v-if="poem.genre">{{ poem.genre }}</span>
            <span v-if="poem.date" class="dot">·</span>
            <span v-if="poem.date">{{ formatDate(poem.date) }}</span>
          </p>
        </header>

        <div class="lines">
          <p v-for="(line, i) in poem.body" :key="i">{{ line }}</p>
        </div>

        <footer v-if="list.length > 1" class="foot">
          <button type="button" :disabled="!hasPrev" @click="step(-1)">上一首</button>
          <span class="pos">{{ idx + 1 }} / {{ list.length }}</span>
          <button type="button" :disabled="!hasNext" @click="step(1)">下一首</button>
        </footer>
      </article>
    </div>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(26, 22, 17, 0.46);
  backdrop-filter: blur(6px);
  animation: fade 0.24s var(--ease);
}

.poem-sheet {
  position: relative;
  width: min(100%, 560px);
  max-height: min(84vh, 760px);
  overflow-y: auto;
  padding: 38px 40px 26px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-md);
  animation: rise 0.28s var(--ease);
}

.head {
  text-align: center;
}

.title {
  font-size: 24px;
  letter-spacing: 0.06em;
}

.meta {
  margin-top: 8px;
  font-size: 11.5px;
  letter-spacing: 0.14em;
  color: var(--ink-3);
}

.meta .dot {
  margin: 0 6px;
  opacity: 0.6;
}

.lines {
  margin: 28px 0 30px;
  text-align: center;
}

.lines p {
  font-family: var(--font-serif);
  font-size: 17.5px;
  line-height: 2.15;
  letter-spacing: 0.06em;
  color: var(--ink);
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.foot button {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--line-2);
  font-size: 12.5px;
  color: var(--ink-2);
  transition:
    color 0.2s var(--ease),
    border-color 0.2s var(--ease),
    background 0.2s var(--ease);
}

.foot button:not(:disabled):hover {
  color: var(--accent);
  border-color: var(--accent);
  background: #fff;
}

.foot button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pos {
  font-size: 11.5px;
  letter-spacing: 0.1em;
  color: var(--ink-3);
}

.close {
  position: absolute;
  top: 10px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  color: var(--ink-3);
  transition:
    color 0.2s var(--ease),
    background 0.2s var(--ease);
}

.close:hover {
  color: var(--ink);
  background: rgba(36, 31, 26, 0.05);
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}

@media (max-width: 620px) {
  .poem-sheet {
    padding: 34px 22px 20px;
    max-height: 88vh;
  }

  .lines p {
    font-size: 16px;
    line-height: 2.05;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mask,
  .poem-sheet {
    animation: none;
  }
}
</style>
