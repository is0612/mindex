<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { profile } from '@/data/profile'

const links = [
  { id: 'works', label: '作品' },
  { id: 'poetry', label: '诗词' },
  { id: 'about', label: '关于' },
]

const active = ref('')
const menuOpen = ref(false)

function measure() {
  let current = ''
  for (const l of links) {
    const el = document.getElementById(l.id)
    if (el && el.getBoundingClientRect().top <= 200) current = l.id
  }
  active.value = current
}

function onScroll() {
  requestAnimationFrame(measure)
}

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') menuOpen.value = false
}

onMounted(() => {
  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <!-- 悬浮胶囊导航：整条浮在页面上，不贴边 -->
  <div class="dock-wrap">
    <nav class="dock" :aria-label="'页面导航'">
      <a class="dock__brand" href="#top">
        <span class="dock__dot" aria-hidden="true">{{ profile.initial }}</span>
        <span class="dock__name">{{ profile.name }}</span>
      </a>

      <div class="dock__links">
        <a
          v-for="l in links"
          :key="l.id"
          :href="`#${l.id}`"
          :class="{ 'is-on': active === l.id }"
        >
          {{ l.label }}
        </a>
      </div>

      <a class="dock__cta" :href="`mailto:${profile.email}`">联系我</a>

      <button
        class="dock__toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-label="打开菜单"
        @click="menuOpen = !menuOpen"
      >
        <span />
      </button>
    </nav>

    <Transition name="pop">
      <div v-if="menuOpen" class="sheet card">
        <a
          v-for="l in [...links, { id: 'contact', label: '联系' }]"
          :key="l.id"
          class="sheet__link"
          :href="`#${l.id}`"
          @click="menuOpen = false"
        >
          {{ l.label }}
        </a>
        <a class="sheet__mail" :href="`mailto:${profile.email}`" @click="menuOpen = false">
          {{ profile.email }} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dock-wrap {
  position: fixed;
  top: 16px;
  left: 0;
  right: 0;
  z-index: 80;
  display: flex;
  justify-content: center;
  padding: 0 16px;
  pointer-events: none;
}

.dock {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(100%, 720px);
  height: 56px;
  padding: 0 8px 0 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 18px 40px -24px rgba(30, 93, 168, 0.6);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
}

.dock__brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.dock__dot {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--blue), var(--blue-2));
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.dock__name {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.dock__links {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.dock__links a {
  padding: 8px 13px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--ink-2);
  transition:
    background 0.25s var(--ease),
    color 0.25s var(--ease);
}

.dock__links a:hover {
  background: rgba(255, 255, 255, 0.85);
  color: var(--ink);
}

.dock__links a.is-on {
  background: var(--blue);
  color: #fff;
}

.dock__cta {
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--blue), var(--blue-2));
  box-shadow: 0 12px 24px -14px rgba(30, 93, 168, 0.9);
  transition: transform 0.25s var(--ease), filter 0.25s var(--ease);
}

.dock__cta:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

/* —— 移动端 —— */
.dock__toggle {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  position: relative;
}

.dock__toggle span,
.dock__toggle span::before {
  content: '';
  position: absolute;
  left: 12px;
  width: 16px;
  height: 1.6px;
  background: var(--ink);
  border-radius: 2px;
}

.dock__toggle span {
  top: 19px;
}

.dock__toggle span::before {
  top: -5px;
}

.sheet {
  pointer-events: auto;
  position: absolute;
  top: 68px;
  left: 16px;
  right: 16px;
  padding: 12px 18px 16px;
}

.sheet__link {
  display: block;
  padding: 13px 4px;
  font-size: 17px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 0 rgba(65, 86, 107, 0.08);
}

.sheet__mail {
  display: flex;
  justify-content: space-between;
  padding-top: 14px;
  font-size: 13px;
  color: var(--blue-deep);
  font-weight: 600;
}

.pop-enter-active,
.pop-leave-active {
  transition:
    opacity 0.25s var(--ease),
    transform 0.25s var(--ease);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 720px) {
  .dock__links,
  .dock__cta {
    display: none;
  }

  .dock__toggle {
    display: block;
    margin-left: auto;
  }

  .dock {
    width: 100%;
  }
}
</style>
