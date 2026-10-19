<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useGallery } from '@/data/gallery'
import { photoSrc } from '@/data/photos'
import FilterTabs from '@/components/FilterTabs.vue'
import SectionHead from '@/components/SectionHead.vue'
import PhotoLightbox from '@/components/PhotoLightbox.vue'

// 相册数据在 public/photos.json + albums.json，运行时加载
const { photos, categories, loading, failed, load } = useGallery()
onMounted(load)

const active = ref('全部')

const filtered = computed(() =>
  active.value === '全部'
    ? photos.value
    : photos.value.filter((p) => p.category === active.value),
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

      <FilterTabs
        v-if="!loading && !failed"
        v-model="active"
        :options="categories"
        label="相册分类"
        :count="`${filtered.length} 张`"
      />

      <div v-if="loading" class="grid" aria-busy="true" aria-label="相册加载中">
        <span v-for="n in 8" :key="n" class="skeleton" />
      </div>

      <p v-else-if="failed" class="gallery-error">
        相册数据没加载出来。确认 <code>public/photos.json</code> 存在，并且页面是通过本地服务器
        （<code>yarn dev</code>）打开的 —— 直接双击 html 文件时浏览器不允许读取本地 JSON。
      </p>

      <div v-else :key="active" class="grid">
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

/* 数据加载中的占位块 */
.skeleton {
  display: block;
  aspect-ratio: 4 / 5;
  border-radius: 8px;
  background: linear-gradient(
    100deg,
    rgba(231, 226, 214, 0.5) 28%,
    rgba(250, 247, 240, 0.92) 48%,
    rgba(231, 226, 214, 0.5) 68%
  );
  background-size: 220% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  from {
    background-position: 130% 0;
  }
  to {
    background-position: -130% 0;
  }
}

.gallery-error {
  padding: 24px 22px;
  border: 1px dashed var(--line-2);
  border-radius: 10px;
  color: var(--ink-3);
  font-size: 13.5px;
  line-height: 1.95;
}

.gallery-error code {
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(36, 31, 26, 0.06);
  font-size: 12.5px;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
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
