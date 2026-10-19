<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { formatDate, poemLayout, type Poem } from '@/data/poems'

const props = defineProps<{
  poem: Poem
  list: Poem[]
}>()

const emit = defineEmits<{
  'update:poem': [poem: Poem]
  close: []
}>()

/** 与首页同一套排版规则 */
const layout = computed(() => poemLayout(props.poem))

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

const scrollEl = ref<HTMLElement | null>(null)

// 换诗时滚回顶部
watch(
  () => props.poem.id,
  () => {
    scrollEl.value?.scrollTo({ top: 0, left: 0 })
  },
)
</script>

<template>
  <!-- 挂到 body：外层 .reveal 的 transform 会把 fixed 定位锁在区块里 -->
  <Teleport to="body">
    <div class="mask" role="dialog" aria-modal="true" :aria-label="poem.title" @click.self="emit('close')">
      <!-- 高度固定：翻页时弹窗不忽高忽低 -->
      <article class="poem-sheet" :class="`is-${layout}`">
        <button class="close" type="button" aria-label="关闭" @click="emit('close')">×</button>

        <header class="head">
          <h3 class="title">{{ poem.title }}</h3>
          <p class="meta">
            <span v-if="poem.genre">{{ poem.genre }}</span>
            <span v-if="poem.date" class="dot">·</span>
            <span v-if="poem.date">{{ formatDate(poem.date) }}</span>
            <span v-if="poem.body.length > 12" class="dot">·</span>
            <span v-if="poem.body.length > 12">共 {{ poem.body.length }} 句</span>
          </p>
        </header>

        <div ref="scrollEl" class="lines">
          <div class="verse-body">
            <p v-for="(line, i) in poem.body" :key="i">{{ line }}</p>
          </div>
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
  display: flex;
  flex-direction: column;
  width: min(100%, 580px);
  /* 固定高度，翻页时弹窗和按钮都不动 */
  height: min(80vh, 620px);
  padding: 34px 40px 20px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-md);
  animation: rise 0.28s var(--ease);
}

.head {
  flex: 0 0 auto;
  min-height: 62px;
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

/* 中间内容区，超长时内部滚动 */
.lines {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  padding: 14px 4px 14px 0;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(71, 104, 157, 0.24) transparent;
}

.lines::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.lines::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(71, 104, 157, 0.22);
}

.lines::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 104, 157, 0.4);
}

.lines::-webkit-scrollbar-track {
  background: transparent;
}

.verse-body {
  margin: auto;
  font-family: var(--font-serif);
  color: var(--ink);
}

/* 竖排：line-height 是列宽，letter-spacing 才是字距 */
.is-vertical .verse-body {
  writing-mode: vertical-rl;
  font-size: clamp(17px, 2.2vw, 20px);
  line-height: 1.8;
  letter-spacing: 0.14em;
}

.is-vertical .verse-body p {
  margin: 0;
  white-space: nowrap;
}

/* 列间距，首尾不留才能居中 */
.is-vertical .verse-body p + p {
  margin-left: 26px;
}

/* 横排 */
.is-flat .verse-body {
  width: 100%;
  text-align: center;
}

.is-flat .verse-body p {
  font-size: 17px;
  line-height: 2.15;
  letter-spacing: 0.05em;
  white-space: pre-wrap;
  text-wrap: pretty;
}

.foot {
  flex: 0 0 auto;
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
    padding: 30px 20px 16px;
    height: min(86vh, 620px);
  }

  .head {
    min-height: 56px;
  }

  .title {
    font-size: 21px;
  }

  .is-flat .verse-body p {
    font-size: 16px;
    line-height: 2.05;
  }

  .is-vertical .verse-body {
    font-size: 16px;
    line-height: 1.85;
    letter-spacing: 0.12em;
  }

  .is-vertical .verse-body p + p {
    margin-left: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mask,
  .poem-sheet {
    animation: none;
  }
}
</style>
