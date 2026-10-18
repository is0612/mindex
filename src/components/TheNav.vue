<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { navLinks, profile } from '@/data/profile'

const stuck = ref(false)
const active = ref('')

let io: IntersectionObserver | null = null

function onScroll() {
  stuck.value = window.scrollY > 8
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) active.value = `#${entry.target.id}`
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )

  for (const link of navLinks) {
    const el = document.getElementById(link.href.slice(1))
    if (el) io.observe(el)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  io?.disconnect()
})
</script>

<template>
  <header class="nav" :class="{ 'is-stuck': stuck }">
    <div class="container nav-inner">
      <a class="brand" href="#home">
        <span class="brand-seal">{{ profile.initial }}</span>
        <span class="brand-name">{{ profile.name }}</span>
      </a>

      <nav class="links" aria-label="主导航">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          :class="{ active: active === link.href }"
        >
          {{ link.label }}
        </a>
      </nav>

      <a class="mail" :href="`mailto:${profile.email}`">写信给我</a>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  height: var(--nav-h);
  display: flex;
  align-items: center;
  border-bottom: 1px solid transparent;
  transition:
    background 0.35s var(--ease),
    border-color 0.35s var(--ease),
    backdrop-filter 0.35s var(--ease);
}

.nav.is-stuck {
  background: rgba(246, 243, 236, 0.78);
  border-bottom-color: var(--line);
  backdrop-filter: blur(16px) saturate(1.3);
}

.nav-inner {
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.brand-seal {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 3px;
  background: var(--seal);
  color: #fff8f2;
  font-family: var(--font-serif);
  font-size: 12px;
  line-height: 1;
  padding-top: 1px;
}

.brand-name {
  font-family: var(--font-serif);
  font-size: 18px;
  letter-spacing: 0.1em;
}

.links {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-left: auto;
}

.links a {
  position: relative;
  font-size: 14.5px;
  color: var(--ink-2);
  transition: color 0.25s var(--ease);
}

.links a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 0;
  height: 1px;
  background: var(--accent);
  transition: width 0.3s var(--ease);
}

.links a:hover {
  color: var(--ink);
}

.links a:hover::after,
.links a.active::after {
  width: 100%;
}

.links a.active {
  color: var(--accent);
}

.mail {
  flex-shrink: 0;
  font-size: 13.5px;
  color: var(--ink-2);
  padding: 7px 16px;
  border: 1px solid var(--line-2);
  border-radius: 999px;
  transition:
    color 0.25s var(--ease),
    border-color 0.25s var(--ease),
    background 0.25s var(--ease);
}

.mail:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: #fff;
}

@media (max-width: 780px) {
  .links {
    gap: 20px;
  }

  .links a {
    font-size: 14px;
  }

  .mail {
    display: none;
  }

  .brand-name {
    font-size: 16px;
  }
}

@media (max-width: 520px) {
  .links {
    gap: 14px;
  }

  .links a {
    font-size: 13px;
  }

  .brand-name {
    display: none;
  }
}
</style>
