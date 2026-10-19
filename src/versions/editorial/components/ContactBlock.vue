<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { profile } from '@/data/profile'

const copied = ref(false)
let timer = 0

async function copy() {
  try {
    await navigator.clipboard.writeText(profile.email)
  } catch {
    /* 老浏览器直接让用户自己选中 */
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
      <header class="sec-head">
        <div class="sec-head__left">
          <span class="sec-head__no">第四章</span>
          <h2>联系</h2>
          <span class="sec-head__en">Get in Touch</span>
        </div>
        <p class="sec-head__note">不着急的事也欢迎，两三天之内一定回。</p>
      </header>

      <div class="contact__grid">
        <div class="contact__main">
          <p class="contact__lead">写封邮件，谈谈照片、句子，或者一个还没想清楚的念头。</p>
          <a class="contact__mail" :href="`mailto:${profile.email}`">{{ profile.email }}</a>
          <div class="contact__row">
            <a class="btn" :href="`mailto:${profile.email}`">开始写信 ↗</a>
            <button type="button" class="link" @click="copy">
              {{ copied ? '已复制到剪贴板' : '复制邮箱' }}
            </button>
          </div>
        </div>

        <ul class="contact__socials">
          <li v-for="s in profile.socials" :key="s.label">
            <a :href="s.href" target="_blank" rel="noreferrer noopener">
              <span>{{ s.label }}</span>
              <span class="arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </div>

      <footer class="foot">
        <span>© 二〇二六 {{ profile.name }} · {{ profile.location }}</span>
        <span class="foot__mid">方案 01 / 编辑杂志</span>
        <a href="#top">回到卷首 ↑</a>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding-bottom: 40px;
}

.contact__grid {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
  gap: 72px;
  align-items: start;
}

.contact__lead {
  font-size: 13.5px;
  color: var(--ink-2);
  max-width: 26em;
}

.contact__mail {
  display: inline-block;
  margin-top: 22px;
  font-family: var(--font-serif);
  font-size: clamp(1.5rem, 3.6vw, 2.6rem);
  letter-spacing: 0.02em;
  border-bottom: 1px solid var(--line-strong);
  padding-bottom: 6px;
  transition:
    color 0.3s var(--ease),
    border-color 0.3s var(--ease);
}

.contact__mail:hover {
  color: var(--seal);
  border-bottom-color: var(--seal);
}

.contact__row {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.contact__socials {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
}

.contact__socials a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  font-size: 13px;
  color: var(--ink-2);
  transition:
    color 0.25s var(--ease),
    padding-left 0.3s var(--ease);
}

.contact__socials a:hover {
  color: var(--seal);
  padding-left: 8px;
}

.arrow {
  font-size: 11px;
  color: var(--ink-4);
}

.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 88px;
  padding-top: 16px;
  border-top: 1px solid var(--line-strong);
  font-size: 10.5px;
  letter-spacing: 0.1em;
  color: var(--ink-4);
}

.foot a:hover {
  color: var(--ink);
}

@media (max-width: 900px) {
  .contact__grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .foot {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    margin-top: 56px;
  }

  .foot__mid {
    display: none;
  }
}
</style>
