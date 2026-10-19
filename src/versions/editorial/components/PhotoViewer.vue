<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Photo } from '@/data/photos'
import { coverSrc } from '@/versions/shared/artwork'

const props = defineProps<{ photos: Photo[]; start: number }>()
const emit = defineEmits<{ close: [] }>()

const index = ref(props.start)
const current = computed(() => props.photos[index.value])
let lastFocus: Element | null = null

function go(step: number) {
  const n = props.photos.length
  index.value = (index.value + step + n) % n
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'ArrowLeft') go(-1)
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
    <div class="viewer" role="dialog" aria-modal="true" :aria-label="current.title">
      <div class="viewer__head">
        <span>{{ String(index + 1).padStart(2, '0') }} / {{ props.photos.length }}</span>
        <button type="button" class="viewer__close" @click="emit('close')">关闭 ✕</button>
      </div>

      <div class="viewer__stage">
        <button type="button" class="viewer__arrow" aria-label="上一张" @click="go(-1)">←</button>
        <figure class="viewer__figure">
          <img :src="coverSrc(current)" :alt="current.title" />
          <figcaption>
            <span class="viewer__title">{{ current.title }}</span>
            <span class="viewer__meta">{{ current.category }} · {{ current.date }}</span>
          </figcaption>
        </figure>
        <button type="button" class="viewer__arrow" aria-label="下一张" @click="go(1)">→</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.viewer {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  padding: 26px 40px 34px;
  background: rgba(247, 244, 237, 0.97);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: fade 0.3s var(--ease);
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

.viewer__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--ink-3);
  padding-bottom: 14px;
  border-bottom: 1px solid var(--line);
}

.viewer__close {
  font-size: 11.5px;
  letter-spacing: 0.1em;
  color: var(--ink-2);
  transition: color 0.25s var(--ease);
}

.viewer__close:hover {
  color: var(--seal);
}

.viewer__stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 26px;
  padding-top: 22px;
}

.viewer__figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  justify-content: center;
}

.viewer__figure img {
  max-width: 100%;
  max-height: calc(100vh - 170px);
  width: auto;
  height: auto;
  object-fit: contain;
  border: 1px solid var(--line);
  background: var(--paper-2);
}

.viewer__figure figcaption {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: baseline;
  border-top: 1px solid var(--line);
  padding-top: 10px;
}

.viewer__title {
  font-family: var(--font-serif);
  font-size: 16px;
  letter-spacing: 0.04em;
}

.viewer__meta {
  font-size: 10.5px;
  letter-spacing: 0.08em;
  color: var(--ink-4);
}

.viewer__arrow {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border: 1px solid var(--line-strong);
  font-size: 15px;
  color: var(--ink-2);
  transition:
    background 0.25s var(--ease),
    color 0.25s var(--ease);
}

.viewer__arrow:hover {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
}

@media (max-width: 720px) {
  .viewer {
    padding: 18px 18px 26px;
  }

  .viewer__stage {
    gap: 12px;
  }

  .viewer__arrow {
    width: 40px;
    height: 40px;
  }

  .viewer__figure img {
    max-height: calc(100vh - 210px);
  }

  .viewer__figure figcaption {
    flex-direction: column;
    gap: 2px;
  }
}
</style>
