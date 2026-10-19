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
      <div class="viewer__bar">
        <span class="viewer__count">
          {{ String(index + 1).padStart(2, '0') }} / {{ String(props.photos.length).padStart(2, '0') }}
        </span>
        <span class="viewer__name">{{ current.title }}</span>
        <button type="button" class="viewer__close" @click="emit('close')">CLOSE ✕</button>
      </div>

      <div class="viewer__stage">
        <button type="button" class="viewer__nav" aria-label="上一张" @click="go(-1)">←</button>
        <img :src="coverSrc(current)" :alt="current.title" />
        <button type="button" class="viewer__nav" aria-label="下一张" @click="go(1)">→</button>
      </div>

      <div class="viewer__meta">
        <span>{{ current.category }}</span>
        <span>{{ current.date }}</span>
        <span class="viewer__hint">← → 翻页 / ESC 关闭</span>
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
  background: var(--white);
  animation: fade 0.12s ease;
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

.viewer__bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--rule);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
}

.viewer__count {
  color: var(--red);
}

.viewer__name {
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.viewer__close {
  justify-self: end;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--gray);
  transition: color var(--fast);
}

.viewer__close:hover {
  color: var(--red);
}

.viewer__stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
}

.viewer__stage img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.viewer__nav {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 1px solid var(--rule);
  font-size: 14px;
  transition:
    background var(--fast),
    color var(--fast);
}

.viewer__nav:hover {
  background: var(--ink);
  color: var(--white);
}

.viewer__meta {
  display: flex;
  gap: 24px;
  padding: 12px 24px;
  border-top: 1px solid var(--hair);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--gray);
}

.viewer__hint {
  margin-left: auto;
  color: var(--gray-2);
}

@media (max-width: 640px) {
  .viewer__stage {
    gap: 8px;
    padding: 12px;
  }

  .viewer__hint {
    display: none;
  }

  .viewer__meta {
    gap: 14px;
  }
}
</style>
