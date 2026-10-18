<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { photoSrc, type Photo } from '@/data/photos'

const props = defineProps<{
  photos: Photo[]
  index: number | null
}>()

const emit = defineEmits<{
  'update:index': [value: number | null]
}>()

const isOpen = computed(() => props.index !== null && props.photos.length > 0)

const current = computed<Photo | null>(() =>
  props.index === null ? null : (props.photos[props.index] ?? null),
)

const counter = computed(() =>
  props.index === null ? '' : `${props.index + 1} / ${props.photos.length}`,
)

function close() {
  emit('update:index', null)
}

function go(step: number) {
  if (props.index === null) return
  const len = props.photos.length
  if (len === 0) return
  emit('update:index', (props.index + step + len) % len)
}

function onKey(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowLeft') go(-1)
  else if (e.key === 'ArrowRight') go(1)
}

let prevOverflow = ''

watch(
  isOpen,
  (open) => {
    if (typeof document !== 'undefined') {
      if (open) {
        prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = prevOverflow
      }
    }
    if (typeof window === 'undefined') return
    if (open) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = prevOverflow
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onKey)
})

/* 移动端左右滑动切换 */
const touchStartX = ref(0)

function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.changedTouches[0].clientX
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX.value
  if (Math.abs(dx) > 55) go(dx > 0 ? -1 : 1)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lb">
      <div
        v-if="isOpen && current"
        class="lb"
        role="dialog"
        aria-modal="true"
        :aria-label="`照片：${current.title}`"
        @click.self="close"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <button type="button" class="icon-btn close" aria-label="关闭" @click="close">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <button
          v-if="photos.length > 1"
          type="button"
          class="icon-btn side prev"
          aria-label="上一张"
          @click.stop="go(-1)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>

        <button
          v-if="photos.length > 1"
          type="button"
          class="icon-btn side next"
          aria-label="下一张"
          @click.stop="go(1)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <figure class="stage" @click.stop>
          <img :key="current.id" :src="photoSrc(current)" :alt="current.title" />
          <figcaption>
            <span class="title">{{ current.title }}</span>
            <span class="meta">{{ current.category }} · {{ current.date }}</span>
          </figcaption>
        </figure>

        <div class="counter">{{ counter }}</div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lb {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 48px 24px;
  background: rgba(24, 21, 17, 0.9);
  backdrop-filter: blur(10px) saturate(1.1);
}

.stage {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  max-width: 100%;
}

.stage img {
  max-width: min(86vw, 820px);
  max-height: 68vh;
  border-radius: 6px;
  object-fit: contain;
  box-shadow: 0 48px 90px -34px rgba(0, 0, 0, 0.85);
  animation: pop 0.42s var(--ease) both;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.975);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

figcaption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  color: #f4efe4;
}

figcaption .title {
  font-family: var(--font-serif);
  font-size: 18px;
  letter-spacing: 0.06em;
}

figcaption .meta {
  font-size: 12.5px;
  letter-spacing: 0.1em;
  opacity: 0.6;
}

.counter {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  letter-spacing: 0.18em;
  color: rgba(244, 239, 228, 0.5);
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(244, 239, 228, 0.18);
  background: rgba(244, 239, 228, 0.06);
  color: rgba(244, 239, 228, 0.85);
  transition:
    background 0.25s var(--ease),
    border-color 0.25s var(--ease),
    color 0.25s var(--ease);
}

.icon-btn svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.icon-btn:hover {
  background: rgba(244, 239, 228, 0.16);
  border-color: rgba(244, 239, 228, 0.4);
  color: #fff;
}

.close {
  position: absolute;
  top: 20px;
  right: 20px;
}

.side {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.prev {
  left: 22px;
}

.next {
  right: 22px;
}

/* 灯箱开合 */
.lb-enter-active,
.lb-leave-active {
  transition: opacity 0.32s var(--ease);
}

.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .lb {
    padding: 64px 16px;
  }

  .stage img {
    max-width: 92vw;
    max-height: 62vh;
  }

  .side {
    display: none;
  }

  .close {
    top: 14px;
    right: 14px;
  }
}
</style>
