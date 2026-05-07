<script setup lang="ts">
const props = defineProps<{
  date: string
  lunarDate: string
}>()

const emit = defineEmits<{
  (e: 'update:date', value: string): void
  (e: 'update:lunarDate', value: string): void
}>()

const onDateChange = (e: any) => {
  emit('update:date', e.detail.value)
  emit('update:lunarDate', generateLunarDate(new Date(e.detail.value)))
}
</script>

<template>
  <picker :value="props.date" mode="date" @change="onDateChange">
    <div class="flex items-center rounded-lg bg-[#F2F3F5] p-2">
      <div class="mr-2 text-2xl text-red font-bold">
        {{ props.date ? props.date.split('-')[2] : '--' }}
      </div>
      <div>
        <div>{{ props.lunarDate }}</div>
        <div class="text-sm text-gray">
          {{ props.date }}
        </div>
      </div>
      <div class="ml-auto">
        <wd-icon name="right" />
      </div>
    </div>
  </picker>
</template>
