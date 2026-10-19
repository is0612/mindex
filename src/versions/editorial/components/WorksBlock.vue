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

function show(index: number) {
  start.value = index
  open.value = true
}
</script>

<template>
  <section id="works" class="section">
    <div class="shell">
      <header class="sec-head">
        <div class="sec-head__left">
          <span class="sec-head__no">第一章</span>
          <h2>作品</h2>
          <span class="sec-head__en">Photographs</span>
        </div>
        <p class="sec-head__note">街头、山野与桌面上的边角。点开看大图，键盘左右可翻。</p>
      </header>

      <div class="filter">
        <span class="filter__label">分类</span>
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
        <span class="filter__count">{{ list.length }} 帧</span>
      </div>

      <!-- 两栏错落：右栏整体下沉，形成版面上的呼吸 -->
      <div class="grid">
        <figure
          v-for="(photo, index) in list"
          :key="photo.id"
          class="plate"
          v-reveal
        >
          <button type="button" class="plate__btn" @click="show(index)">
            <img :src="coverSrc(photo)" :alt="photo.title" loading="lazy" />
          </button>
          <figcaption>
            <span class="plate__no">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="plate__title">{{ photo.title }}</span>
            <span class="plate__meta">{{ photo.category }} · {{ photo.date }}</span>
          </figcaption>
        </figure>
      </div>
    </div>

    <PhotoViewer v-if="open" :photos="list" :start="start" @close="open = false" />
  </section>
</template>

<style scoped>
.filter {
  display: flex;
  align-items: baseline;
  gap: 18px;
  padding-bottom: 20px;
  margin-bottom: 34px;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}

.filter__label {
  font-size: 10.5px;
  letter-spacing: 0.24em;
  color: var(--ink-4);
}

.filter__item {
  font-size: 13px;
  color: var(--ink-3);
  padding: 2px 0;
  border-bottom: 1px solid transparent;
  transition:
    color 0.25s var(--ease),
    border-color 0.25s var(--ease);
}

.filter__item:hover {
  color: var(--ink);
}

.filter__item.is-on {
  color: var(--ink);
  border-bottom-color: var(--ink);
}

.filter__count {
  margin-left: auto;
  font-family: var(--font-serif);
  font-size: 12px;
  letter-spacing: 0.16em;
  color: var(--ink-4);
}

/* —— 两栏，右列下沉 —— */
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 56px 44px;
}

.plate:nth-child(even) {
  transform: translateY(58px);
}

.plate {
  margin: 0;
}

.plate__btn {
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
  background: var(--paper-deep);
  border: 1px solid var(--line);
  cursor: zoom-in;
}

.plate__btn img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  filter: saturate(0.94);
  transition:
    transform 1s var(--ease),
    filter 0.5s var(--ease);
}

.plate__btn:hover img {
  transform: scale(1.02);
  filter: saturate(1.02);
}

.plate figcaption {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 10px;
  margin-top: 12px;
}

.plate__no {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--seal);
}

.plate__title {
  font-family: var(--font-serif);
  font-size: 16px;
  letter-spacing: 0.03em;
}

.plate__meta {
  font-size: 10.5px;
  letter-spacing: 0.06em;
  color: var(--ink-4);
}

@media (max-width: 780px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .plate:nth-child(even) {
    transform: none;
  }
}

@media (max-width: 520px) {
  .filter {
    gap: 12px;
  }

  .plate figcaption {
    grid-template-columns: 26px minmax(0, 1fr);
  }

  .plate__meta {
    display: none;
  }
}
</style>
