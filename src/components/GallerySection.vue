<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { photos, photoSrc } from '@/data/photos'
import SectionHead from '@/components/SectionHead.vue'
import PhotoLightbox from '@/components/PhotoLightbox.vue'

const categories = computed(() => ['全部', ...Array.from(new Set(photos.map((p) => p.category)))])
const active = ref('全部')

const filtered = computed(() =>
  active.value === '全部' ? photos : photos.filter((p) => p.category === active.value),
)

const currentIndex = ref<number | null>(null)

// 换分类时顺手关掉灯箱，避免索引错位
watch(active, () => {
  currentIndex.value = null
})

function open(index: number) {
  currentIndex.value = index
}
</script>

<template>
  <section id="gallery" class="section">
    <div class="container">
      <SectionHead
        v-reveal
        eyebrow="GALLERY"
        title="相册"
        desc="随手拍下的一些光。点开可以放大，键盘左右键也能翻页。"
      />

      <div class="toolbar" v-reveal="60">
        <div class="filters" role="tablist" aria-label="相册分类">
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            role="tab"
            :aria-selected="active === cat"
            :class="{ active: active === cat }"
            @click="active = cat"
          >
            {{ cat }}
          </button>
        </div>
        <span class="count">{{ filtered.length }} 张</span>
      </div>

      <div :key="active" class="grid">
        <button
          v-for="(photo, i) in filtered"
          :key="photo.id"
          v-reveal="(i % 4) * 70"
          type="button"
          class="card"
          :aria-label="`查看照片：${photo.title}`"
          @click="open(i)"
        >
          <img :src="photoSrc(photo)" :alt="photo.title" loading="lazy" decoding="async" />
          <span class="veil" aria-hidden="true"></span>
          <span class="meta">
            <span class="cat">{{ photo.category }}</span>
            <span class="title">{{ photo.title }}</span>
            <span class="date">{{ photo.date }}</span>
          </span>
        </button>
      </div>
    </div>

    <PhotoLightbox v-model:index="currentIndex" :photos="filtered" />
  </section>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filters button {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 13.5px;
  color: var(--ink-3);
  transition:
    color 0.25s var(--ease),
    background 0.25s var(--ease),
    border-color 0.25s var(--ease);
}

.filters button:hover {
  color: var(--ink);
  background: rgba(255, 255, 255, 0.6);
}

.filters button.active {
  color: var(--accent);
  background: var(--accent-wash);
  border-color: rgba(47, 93, 80, 0.16);
  font-weight: 500;
}

.count {
  font-size: 12.5px;
  letter-spacing: 0.08em;
  color: var(--ink-3);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(228px, 1fr));
  gap: 18px;
}

.card {
  position: relative;
  display: block;
  padding: 0;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 8px;
  background: #e7e2d6;
  box-shadow: var(--shadow-sm);
  /* 用独立的 translate 属性做 hover 位移，避免和 v-reveal 的 transform 打架 */
  transition:
    translate 0.45s var(--ease),
    box-shadow 0.45s var(--ease);
}

.card:hover {
  translate: 0 -4px;
  box-shadow: var(--shadow-md);
}

.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    transform 1.1s var(--ease),
    filter 0.5s var(--ease);
}

.card:hover img {
  transform: scale(1.055);
}

.veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(26, 22, 17, 0.76) 0%,
    rgba(26, 22, 17, 0.24) 34%,
    rgba(26, 22, 17, 0) 62%
  );
  transition: opacity 0.4s var(--ease);
}

.card:hover .veil {
  opacity: 1;
}

.meta {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  text-align: left;
  color: #fdfbf6;
}

.meta .cat {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.68;
}

.meta .title {
  font-family: var(--font-serif);
  font-size: 15.5px;
  letter-spacing: 0.02em;
  line-height: 1.5;
}

.meta .date {
  font-size: 11.5px;
  opacity: 0.6;
  margin-top: 1px;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .meta {
    padding: 12px 12px 10px;
  }

  .meta .title {
    font-size: 14px;
  }
}
</style>
