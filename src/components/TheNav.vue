<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { navLinks, profile } from '@/data/profile'

const stuck = ref(false)
const active = ref('')
/** 0~1 的阅读进度，画成导航底部的细线 */
const progress = ref(0)

let io: IntersectionObserver | null = null
let ticking = false

function update() {
  const doc = document.documentElement
  const max = doc.scrollHeight - window.innerHeight
  stuck.value = window.scrollY > 8
  progress.value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
}

/** 滚动事件只负责排队，真正读布局放到下一帧，省掉重复回流 */
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    update()
  })
}

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })

  io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        // 回到首屏时清空高亮，别让上一个区块一直亮着
        active.value = entry.target.id === 'home' ? '' : `#${entry.target.id}`
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )

  for (const id of ['home', ...navLinks.map((link) => link.href.slice(1))]) {
    const el = document.getElementById(id)
    if (el) io.observe(el)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  io?.disconnect()
})
</script>

<template>
  <header class="nav" :class="{ 'is-stuck': stuck }">
    <div class="container nav-inner">
      <a class="brand" href="#home" aria-label="回到首页">
        <span class="brand-seal" aria-hidden="true">{{ profile.initial }}</span>
        <span class="brand-name">{{ profile.name }}</span>
      </a>

      <nav class="links" aria-label="主导航">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          :class="{ active: active === link.href }"
          :aria-current="active === link.href ? 'location' : undefined"
        >
          {{ link.label }}
        </a>
      </nav>

      <a v-if="profile.email" class="mail" :href="`mailto:${profile.email}`">写信给我</a>
    </div>

    <span class="progress" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true" />
  </header>
</template>

<style scoped lang="scss">
@use '../styles/mixins' as *;

.nav {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  display: flex;
  align-items: center;
  height: var(--nav-h);
  border-bottom: 1px solid transparent;
  transition:
    background var(--dur-slow) var(--ease),
    border-color var(--dur-slow) var(--ease),
    box-shadow var(--dur-slow) var(--ease);

  &.is-stuck {
    @include glass(18px, rgba(247, 250, 255, 0.86));

    border-bottom-color: var(--line);
    box-shadow: 0 6px 24px -22px rgba(36, 65, 111, 0.55);
  }
}

.nav-inner {
  display: flex;
  align-items: center;
  gap: 28px;
}

.brand {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  border-radius: 8px;

  @include focus-ring(4px);
}

.brand-seal {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  padding-top: 1px;
  border-radius: 8px;
  background: linear-gradient(145deg, #86a9e2, #4b70ae);
  box-shadow: 0 5px 14px -9px rgba(55, 91, 151, 0.8);
  color: #fff;
  font-family: var(--font-serif);
  font-size: 12.5px;
  line-height: 1;
}

.brand-name {
  font-family: var(--font-serif);
  font-size: 18px;
  letter-spacing: 0.12em;
}

.links {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;

  a {
    position: relative;
    padding: 6px 12px;
    border-radius: 999px;
    color: var(--ink-2);
    font-size: 14.5px;
    transition:
      color var(--dur) var(--ease),
      background var(--dur) var(--ease);

    // 选中态：文字变蓝 + 底部一枚短横，不再靠整条下划线
    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      left: 50%;
      width: 14px;
      height: 2px;
      border-radius: 2px;
      background: var(--accent);
      opacity: 0;
      scale: 0.2 1;
      translate: -50% 0;
      transition:
        scale var(--dur) var(--ease),
        opacity var(--dur) var(--ease);
    }

    &:hover {
      color: var(--ink);
      background: rgba(255, 255, 255, 0.62);
    }

    &.active {
      color: var(--accent);

      &::after {
        opacity: 1;
        scale: 1 1;
      }
    }

    @include focus-ring(2px);
  }
}

.mail {
  flex-shrink: 0;
  padding: 7px 16px;
  border: 1px solid var(--line-2);
  border-radius: 999px;
  color: var(--ink-2);
  font-size: 13.5px;
  transition:
    color var(--dur) var(--ease),
    border-color var(--dur) var(--ease),
    background var(--dur) var(--ease);

  &:hover {
    border-color: var(--accent);
    background: #fff;
    color: var(--accent);
  }

  @include mq(md) {
    display: none;
  }
}

// 阅读进度：2px 渐变细线，滚动时贴着导航底边
.progress {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  transform: scaleX(0);
  transform-origin: 0 50%;
  background: linear-gradient(90deg, var(--accent), #a5c5f6);
  opacity: 0.9;
  pointer-events: none;
}

@include mq(sm) {
  .nav-inner {
    gap: 12px;
  }

  .links {
    gap: 0;

    a {
      padding: 6px 8px;
      font-size: 13px;
    }
  }

  .brand-name {
    font-size: 15px;
    letter-spacing: 0.06em;
  }
}

@include mq(xs) {
  .brand-name {
    display: none;
  }
}
</style>
