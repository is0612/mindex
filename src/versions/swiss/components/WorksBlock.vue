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
        <span class="head__no">01</span>
        <h2>作品</h2>
        <span class="head__en">WORKS — {{ String(list.length).padStart(2, '0') }}</span>
        <p class="head__note">点开看大图，键盘左右键可翻页。</p>
      </header>

      <div class="filter">
        <button
          v-for="c in categories"
          :key="c"
          type="button"
          class="filter__item"
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
          class="cell"
          v-reveal
          @click="show(i)"
        >
          <img :src="coverSrc(photo)" :alt="photo.title" loading="lazy" />
          <span class="cell__no">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="cell__bar">
            <span class="cell__title">{{ photo.title }}</span>
            <span class="cell__meta">{{ photo.category }} — {{ photo.date }}</span>
          </span>
        </button>
      </div>
    </div>

    <PhotoViewer v-if="open" :photos="list" :start="start" @close="open = false" />
  </section>
</template>

<style scoped>
.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--hair);
  margin-bottom: 8px;
}

.filter__item {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--gray);
  padding: 2px 0;
  transition: color var(--fast);
}

.filter__item:hover {
  color: var(--ink);
}

.filter__item.is-on {
  color: var(--ink);
  font-weight: 700;
  box-shadow: inset 0 -2px 0 var(--red);
}

/* —— 四列密排，编号叠加 —— */
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.cell {
  position: relative;
  display: block;
  padding: 0;
  overflow: hidden;
  background: var(--paper);
  text-align: left;
  cursor: zoom-in;
}

.cell img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  filter: grayscale(1) contrast(1.04);
  transition:
    filter var(--fast),
    transform 0.3s ease;
}

.cell:hover img {
  filter: grayscale(0.2) contrast(1.02);
  transform: scale(1.015);
}

.cell__no {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 7px;
  background: var(--ink);
  color: var(--white);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

/* 悬停：底部升起黑色信息条 */
.cell__bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding: 10px 14px;
  background: var(--ink);
  color: var(--white);
  transform: translateY(101%);
  transition: transform 0.22s ease;
}

.cell:hover .cell__bar,
.cell:focus-visible .cell__bar {
  transform: none;
}

.cell__title {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell__meta {
  flex-shrink: 0;
  font-size: 9.5px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.65);
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .cell__bar {
    transform: none;
  }
}
</style>
