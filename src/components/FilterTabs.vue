<script setup lang="ts">
/**
 * 胶囊式筛选栏：左边一排选项，右边一个统计数字。
 * 相册按分类筛、诗词按年份筛，共用这一套。
 */
defineProps<{
  modelValue: string
  options: string[]
  /** 无障碍用的分组名 */
  label?: string
  /** 右侧统计文字，例如「12 张」 */
  count?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="toolbar" v-reveal="60">
    <div class="filters" role="tablist" :aria-label="label">
      <button
        v-for="option in options"
        :key="option"
        type="button"
        role="tab"
        :aria-selected="modelValue === option"
        :class="{ active: modelValue === option }"
        @click="$emit('update:modelValue', option)"
      >
        {{ option }}
      </button>
    </div>

    <span v-if="count" class="count">{{ count }}</span>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
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
</style>
