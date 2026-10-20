<script setup lang="ts">
/** 胶囊式筛选栏，诗词按年份筛选用 */
defineProps<{
  modelValue: string
  options: string[]
  /** 无障碍用的分组名 */
  label?: string
  /** 右侧统计文字，例如「12 首」 */
  count?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="toolbar" v-reveal="60">
    <div class="filters" role="group" :aria-label="label">
      <button
        v-for="option in options"
        :key="option"
        type="button"
        :aria-pressed="modelValue === option"
        :class="{ active: modelValue === option }"
        @click="$emit('update:modelValue', option)"
      >
        {{ option }}
      </button>
    </div>

    <span v-if="count" class="count">{{ count }}</span>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/mixins' as *;

.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 22px;
}

// 年份多时横向滚动，不再折成好几行把列表往下推
.filters {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
  padding: 2px 2px 3px;

  button {
    flex: 0 0 auto;
    padding: 5px 10px;
    border: 1px solid transparent;
    border-radius: 999px;
    color: var(--ink-3);
    font-size: 13px;
    line-height: 1.5;
    scroll-snap-align: start;
    transition:
      color var(--dur) var(--ease),
      background var(--dur) var(--ease),
      border-color var(--dur) var(--ease);

    @include focus-ring(2px);

    &:hover {
      background: rgba(255, 255, 255, 0.66);
      color: var(--ink);
    }

    &.active {
      border-color: rgba(63, 102, 160, 0.18);
      background: var(--accent-wash);
      color: var(--accent);
      font-weight: 500;
    }
  }

  // 窄屏/中屏才滚：一行塞不下时不让它把版面撑高，也不会只剩一年孤零零换行
  @include mq(xl) {
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-behavior: smooth;
    scroll-snap-type: x proximity;
    overscroll-behavior-x: contain;

    @include hide-scrollbar;
  }
}

.count {
  flex: 0 0 auto;
  padding-top: 7px;
  color: var(--ink-3);
  font-size: 12.5px;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

@include mq(sm) {
  .toolbar {
    gap: 10px;
    margin-bottom: 18px;
  }

  .filters button {
    padding: 5px 11px;
    font-size: 12.5px;
  }

  .count {
    font-size: 11.5px;
    letter-spacing: 0.04em;
  }
}
</style>
