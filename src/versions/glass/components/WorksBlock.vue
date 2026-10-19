<script setup lang="ts">
import { computed, ref } from 'vue'
import { photos, type Photo } from '@/data/photos'
import { coverSrc } from '@/versions/shared/artwork'
import PhotoViewer from './PhotoViewer.vue'

const categories = computed(() => ['全部', ...Array.from(new Set(photos.map((p) => p.category)))])
const active = ref('全部')
const list = computed<Photo[]>(() =>
  active.value === '全部' ? photos : photos.filter((p) => p.category === active.value),
)

const open = ref(false)
const start = ref(0)

function show(i: number) {
  start.value = i
  open.value = true
}
</script>

<template>
  <section id="works" class="section">
    <div class="shell">
      <header class="head">
        <span class="head__badge">01 · 作品</span>
        <h2>Selected Works</h2>
        <p class="head__note">点开看大图，键盘左右键可翻页，手机上可以左右滑动。</p>
      </header>

      <div class="pills">
        <button
          v-for="c in categories"
          :key="c"
          type="button"
          class="pill"
          :class="{ 'is-on': active === c }"
          @click="active = c"
        >
          {{ c }}
        </button>
      </div>

      <div class="grid">
        <button
          v-for="(photo, i) in list"
          :key="photo.id"
          type="button"
          class="shot card"
          v-reveal
          @click="show(i)"
        >
          <span class="shot__media">
            <img :src="coverSrc(photo)" :alt="photo.title" loading="lazy" />
          </span>
          <span class="shot__info">
            <span class="shot__title">{{ photo.title }}</span>
            <span class="shot__meta">
              <span class="shot__cat">{{ photo.category }}</span>
              <span>{{ photo.date }}</span>
            </span>
          </span>
        </button>
      </div>
    </div>

    <PhotoViewer v-if="open" :photos="list" :start="start" @close="open = false" />
  </section>
</template>

<style scoped>
.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 26px;
}

.pill {
  height: 36px;
  padding: 0 17px;
  border-radius: 999px;
  background: var(--card);
  border: 1px solid var(--card-line);
  font-size: 12.5px;
  color: var(--ink-2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition:
    background 0.25s var(--ease),
    color 0.25s var(--ease),
    box-shadow 0.25s var(--ease);
}

.pill:hover {
  background: #fff;
}

.pill.is-on {
  background: linear-gradient(135deg, var(--blue), var(--blue-2));
  border-color: transparent;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 12px 24px -14px rgba(30, 93, 168, 0.9);
}

/* —— 两列大卡 —— */
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.shot {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 12px;
  text-align: left;
  cursor: zoom-in;
  transition:
    transform 0.35s var(--ease),
    box-shadow 0.35s var(--ease);
}

.shot:hover {
  transform: translateY(-4px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 34px 60px -34px rgba(30, 93, 168, 0.65);
}

.shot__media {
  display: block;
  overflow: hidden;
  border-radius: 18px;
}

.shot__media img {
  width: 100%;
  aspect-ratio: 16 / 11;
  object-fit: cover;
  transition: transform 0.8s var(--ease);
}

.shot:hover .shot__media img {
  transform: scale(1.04);
}

.shot__info {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 6px 6px;
}

.shot__title {
  font-size: 15.5px;
  font-weight: 600;
  color: var(--ink);
}

.shot__meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--ink-3);
}

.shot__cat {
  padding: 2px 9px;
  border-radius: 999px;
  background: rgba(47, 124, 214, 0.1);
  color: var(--blue-deep);
  font-weight: 600;
}

@media (max-width: 780px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
