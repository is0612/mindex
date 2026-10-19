<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Photo } from '@/data/photos'
import { coverSrc } from '@/versions/shared/artwork'

const props = defineProps<{ photos: Photo[]; start: number }>()
const emit = defineEmits<{ close: [] }>()

const index = ref(props.start)
const current = computed(() => props.photos[index.value])
let lastFocus: Element | null = null
let startX = 0
let startY = 0

function go(step: number) {
  const n = props.photos.length
  index.value = (index.value + step + n) % n
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'ArrowLeft') go(-1)
}

function onTouchStart(e: TouchEvent) {
  startX = e.changedTouches[0].clientX
  startY = e.changedTouches[0].clientY
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - startX
  const dy = e.changedTouches[0].clientY - startY
  if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
}

onMounted(() => {
  lastFocus = document.activeElement
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
  if (lastFocus instanceof HTMLElement) lastFocus.focus()
})
</script>

<template>
  <Teleport to="body">
    <div
      class="viewer"
      role="dialog"
      aria-modal="true"
      :aria-label="current.title"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <div class="viewer__scrim" @click="emit('close')" />

      <div class="viewer__card">
        <div class="viewer__media">
          <Transition name="fade" mode="out-in">
            <img :key="current.id" :src="coverSrc(current)" :alt="current.title" />
          </Transition>
        </div>

        <div class="viewer__bar">
          <div class="viewer__meta">
            <span class="viewer__title">{{ current.title }}</span>
            <span class="viewer__sub">{{ current.category }} · {{ current.date }}</span>
          </div>

          <div class="viewer__btns">
            <span class="viewer__count">
              {{ index + 1 }} / {{ props.photos.length }}
            </span>
            <button type="button" class="rbtn" aria-label="上一张" @click="go(-1)">←</button>
            <button type="button" class="rbtn" aria-label="下一张" @click="go(1)">→</button>
            <button
              type="button"
              class="rbtn rbtn--close"
              aria-label="关闭"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.viewer {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 28px;
}

.viewer__scrim {
  position: absolute;
  inset: 0;
  background: rgba(38, 66, 96, 0.45);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  animation: fade 0.3s var(--ease);
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

.viewer__card {
  position: relative;
  width: min(100%, 980px);
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  padding: 14px;
  box-shadow: 0 50px 100px -50px rgba(15, 42, 68, 0.8);
  animation: rise 0.35s var(--ease);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.985);
  }
}

.viewer__media {
  overflow: hidden;
  border-radius: 20px;
  background: var(--sky);
  display: flex;
  justify-content: center;
}

.viewer__media img {
  max-width: 100%;
  max-height: calc(100vh - 200px);
  width: auto;
  height: auto;
  object-fit: contain;
}

.viewer__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 10px 4px;
}

.viewer__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.viewer__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.viewer__sub {
  font-size: 11.5px;
  color: var(--ink-3);
}

.viewer__btns {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.viewer__count {
  margin-right: 6px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--blue-deep);
}

.rbtn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--card-strong);
  border: 1px solid var(--card-line);
  font-size: 14px;
  color: var(--ink-2);
  transition:
    background 0.25s var(--ease),
    color 0.25s var(--ease),
    transform 0.25s var(--ease);
}

.rbtn:hover {
  background: var(--blue);
  color: #fff;
  transform: translateY(-1px);
}

.rbtn--close {
  margin-left: 2px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s var(--ease);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .viewer {
    padding: 14px;
  }

  .viewer__card {
    padding: 10px;
    border-radius: 22px;
  }

  .viewer__media img {
    max-height: calc(100vh - 220px);
  }

  .viewer__bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .viewer__btns {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
