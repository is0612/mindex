<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { profile } from '@/data/profile'

const links = [
  { id: 'works', label: '作品' },
  { id: 'poetry', label: '诗词' },
  { id: 'about', label: '关于' },
  { id: 'contact', label: '联系' },
]

const scrolled = ref(false)
const active = ref('')

function onScroll() {
  const y = window.scrollY
  scrolled.value = y > 8
  let current = ''
  for (const link of links) {
    const el = document.getElementById(link.id)
    if (el && el.getBoundingClientRect().top <= 160) current = link.id
  }
  active.value = current
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="nav" :class="{ 'is-scrolled': scrolled }">
    <div class="nav__inner shell">
      <a class="brand" href="#top">
        <span class="brand__name">{{ profile.name }}</span>
        <span class="brand__seal" aria-hidden="true">{{ profile.initial }}</span>
      </a>

      <nav class="nav__links" aria-label="页面导航">
        <a
          v-for="link in links"
          :key="link.id"
          :href="`#${link.id}`"
          :class="{ 'is-active': active === link.id }"
        >
          {{ link.label }}
        </a>
      </nav>

      <a class="nav__mail" :href="`mailto:${profile.email}`">{{ profile.email }}</a>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  background: var(--paper);
  border-bottom: 1px solid transparent;
  transition: border-color 0.4s var(--ease);
}

.nav.is-scrolled {
  border-bottom-color: var(--line);
}

.nav__inner {
  height: var(--nav-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand__name {
  font-family: var(--font-serif);
  font-size: 17px;
  letter-spacing: 0.18em;
}

.brand__seal {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  background: var(--seal);
  color: #fdf7f2;
  font-family: var(--font-serif);
  font-size: 11px;
  line-height: 1;
}

.nav__links {
  display: flex;
  gap: 30px;
  margin-left: auto;
  margin-right: 40px;
}

.nav__links a {
  position: relative;
  font-size: 13px;
  letter-spacing: 0.12em;
  color: var(--ink-2);
  padding: 4px 0;
  transition: color 0.25s var(--ease);
}

.nav__links a::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: 0 50%;
  transition: transform 0.35s var(--ease);
}

.nav__links a:hover {
  color: var(--ink);
}

.nav__links a:hover::after,
.nav__links a.is-active::after {
  transform: scaleX(1);
}

.nav__links a.is-active {
  color: var(--accent);
}

.nav__mail {
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--ink-3);
  transition: color 0.25s var(--ease);
}

.nav__mail:hover {
  color: var(--seal);
}

@media (max-width: 860px) {
  .nav__mail {
    display: none;
  }

  .nav__links {
    margin-right: 0;
    gap: 20px;
  }

  .nav__links a {
    font-size: 12.5px;
  }
}

@media (max-width: 520px) {
  .brand__name {
    font-size: 16px;
    letter-spacing: 0.12em;
  }

  .nav__links {
    gap: 14px;
  }
}
</style>
