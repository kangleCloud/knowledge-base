<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: '此处为分割线',
  },
)
</script>

<template>
  <div
    class="kb-divider"
    role="separator"
    :aria-label="label"
  >
    <span class="kb-divider__line" aria-hidden="true" />
    <span class="kb-divider__label">{{ label }}</span>
    <span class="kb-divider__line" aria-hidden="true" />
  </div>
</template>
