<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { formatDate, linesOf, type Poem } from '@/data/poems'

const props = defineProps<{
  poem: Poem
  list: Poem[]
}>()

const emit = defineEmits<{
  'update:poem': [poem: Poem]
  close: []
}>()

/** 和首页同一套：正文怎么分行就怎么显示 */
const lines = computed(() => linesOf(props.poem))

const idx = computed(() => props.list.findIndex((p) => p.id === props.poem.id))
const hasPrev = computed(() => idx.value > 0)
const hasNext = computed(() => idx.value >= 0 && idx.value < props.list.length - 1)

function step(delta: number) {
  const target = props.list[idx.value + delta]
  if (target) emit('update:poem', target)
}

const sheetEl = ref<HTMLElement | null>(null)
let lastFocused: HTMLElement | null = null

/** Tab 在弹层里循环，别跑到背后的页面上 */
function trapTab(e: KeyboardEvent) {
  const root = sheetEl.value
  if (!root) return
  const items = Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null)
  if (!items.length) return

  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  else if (e.key === 'ArrowLeft') step(-1)
  else if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'Tab') trapTab(e)
}

let prevOverflow = ''

onMounted(() => {
  lastFocused = document.activeElement as HTMLElement | null
  window.addEventListener('keydown', onKey)
  prevOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  nextTick(() => sheetEl.value?.focus())
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = prevOverflow
  // 关掉弹层后把焦点还给刚才点击的那张卡片
  lastFocused?.focus?.()
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
      <article ref="sheetEl" class="poem-sheet" tabindex="-1">
        <button class="close" type="button" aria-label="关闭" @click="emit('close')">×</button>

        <header class="head">
          <h3 class="title">{{ poem.title }}</h3>
          <p class="meta">
            <span v-if="poem.genre">{{ poem.genre }}</span>
            <span v-if="poem.date" class="dot">·</span>
            <span v-if="poem.date">{{ formatDate(poem.date) }}</span>
            <span v-if="lines.length > 8" class="dot">·</span>
            <span v-if="lines.length > 8">共 {{ lines.length }} 行</span>
          </p>
        </header>

        <div ref="scrollEl" class="lines">
          <div class="verse-body">
            <p v-for="(line, i) in lines" :key="i" :class="{ blank: !line }">{{ line }}</p>
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

<style scoped lang="scss">
@use '../styles/mixins' as *;

.mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 27, 48, 0.48);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: fade 0.24s var(--ease);
}

.poem-sheet {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(100%, 580px);
  // 固定高度，翻页时弹窗和按钮都不动
  height: min(82vh, 660px);
  padding: 30px 40px 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  animation: rise 0.28s var(--ease);
  outline: none;

  @include mq(sm) {
    height: min(86vh, 660px);
    padding: 30px 20px 16px;
  }
}

.head {
  flex: 0 0 auto;
  min-height: 54px;
  text-align: center;
}

.title {
  font-size: 24px;
  letter-spacing: 0.06em;

  @include mq(sm) {
    font-size: 21px;
  }
}

.meta {
  margin-top: 8px;
  color: var(--ink-3);
  font-size: 11.5px;
  letter-spacing: 0.14em;

  .dot {
    margin: 0 6px;
    opacity: 0.6;
  }
}

// 中间内容区，超长时内部滚动
.lines {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 0 8px 0 0;

  @include thin-scrollbar(rgba(71, 104, 157, 0.24));
}

.verse-body {
  width: 100%;
  margin: auto;
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 16.5px;
  line-height: 1.95;
  letter-spacing: 0.05em;
  text-align: center;
  text-wrap: pretty;

  p {
    white-space: pre-wrap;
  }

  // 词的上下阕之间：撑满一行高度，才是真的空一行
  p.blank::before {
    content: '\00a0';
  }

  @include mq(sm) {
    font-size: 16px;
    line-height: 2.05;
  }
}

.foot {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--line);

  button {
    padding: 6px 14px;
    border: 1px solid var(--line-2);
    border-radius: 999px;
    color: var(--ink-2);
    font-size: 12.5px;
    transition:
      color var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease),
      background var(--dur-fast) var(--ease);

    &:not(:disabled):hover {
      border-color: var(--accent);
      background: #fff;
      color: var(--accent);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @include focus-ring(2px);
  }
}

.pos {
  color: var(--ink-3);
  font-size: 11.5px;
  letter-spacing: 0.1em;
  font-variant-numeric: tabular-nums;
}

.close {
  position: absolute;
  top: 10px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--ink-3);
  font-size: 20px;
  line-height: 1;
  transition:
    color var(--dur-fast) var(--ease),
    background var(--dur-fast) var(--ease),
    rotate var(--dur-fast) var(--ease);

  &:hover {
    background: rgba(27, 43, 73, 0.06);
    color: var(--ink);
    rotate: 90deg;
  }

  @include focus-ring(2px);
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

@media (prefers-reduced-motion: reduce) {
  .mask,
  .poem-sheet {
    animation: none;
  }
}
</style>
