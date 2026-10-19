<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { profile } from '@/data/profile'

const copied = ref(false)
let timer = 0

async function copy() {
  try {
    await navigator.clipboard.writeText(profile.email)
  } catch {
    /* 忽略 */
  }
  copied.value = true
  window.clearTimeout(timer)
  timer = window.setTimeout(() => (copied.value = false), 1800)
}

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <section id="contact" class="section contact">
    <div class="shell">
      <header class="head">
        <span class="head__badge">04 · 联系</span>
        <h2>Say Hello</h2>
        <p class="head__note">不着急的事也欢迎，两三天之内一定回。</p>
      </header>

      <div class="box card">
        <div class="box__left">
          <p class="box__lead">写封邮件，聊聊照片、句子，或者一个还没想清楚的念头。</p>
          <a class="box__mail" :href="`mailto:${profile.email}`">{{ profile.email }}</a>
          <div class="box__row">
            <a class="btn" :href="`mailto:${profile.email}`">开始写信</a>
            <button type="button" class="copybtn" :class="{ 'is-done': copied }" @click="copy">
              <span aria-hidden="true">{{ copied ? '✓' : '⧉' }}</span>
              {{ copied ? '已复制' : '复制邮箱' }}
            </button>
          </div>
        </div>

        <ul class="socials">
          <li v-for="s in profile.socials" :key="s.label">
            <a :href="s.href" target="_blank" rel="noreferrer noopener">
              <span>{{ s.label }}</span>
              <span class="arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </div>

      <footer class="foot">
        <span>© 2026 {{ profile.name }} · {{ profile.location }}</span>
        <span class="foot__mid">方案 03 / 轻盈玻璃</span>
        <a href="#top">回到顶部 ↑</a>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding-bottom: 36px;
}

.box {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
  gap: 48px;
  padding: 40px 44px;
}

.box__lead {
  font-size: 14px;
  color: var(--ink-2);
}

.box__mail {
  display: inline-block;
  margin-top: 18px;
  font-size: clamp(1.5rem, 3.6vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ink);
  border-bottom: 3px solid rgba(47, 124, 214, 0.35);
  padding-bottom: 4px;
  transition:
    color 0.25s var(--ease),
    border-color 0.25s var(--ease);
}

.box__mail:hover {
  color: var(--blue-deep);
  border-bottom-color: var(--blue);
}

.box__row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 26px;
  flex-wrap: wrap;
}

.copybtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 22px;
  border-radius: 999px;
  background: var(--card-strong);
  border: 1px solid var(--card-line);
  font-size: 13px;
  font-weight: 600;
  color: var(--blue-deep);
  transition:
    background 0.25s var(--ease),
    transform 0.25s var(--ease);
}

.copybtn:hover,
.copybtn.is-done {
  background: #fff;
  transform: translateY(-1px);
}

.socials {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.socials a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-2);
  transition:
    background 0.25s var(--ease),
    color 0.25s var(--ease),
    transform 0.25s var(--ease);
}

.socials a:hover {
  background: #fff;
  color: var(--blue-deep);
  transform: translateY(-2px);
}

.arrow {
  color: var(--ink-4);
}

.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding: 0 8px;
  font-size: 11px;
  color: var(--ink-3);
}

.foot a:hover {
  color: var(--blue-deep);
}

@media (max-width: 900px) {
  .box {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 26px 24px;
  }

  .foot {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .foot__mid {
    display: none;
  }
}
</style>
