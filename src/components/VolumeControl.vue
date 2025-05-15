<template>
  <div class="volume-control">
    <font-awesome-icon :icon="volumeIcon" />
    <input 
      type="range" 
      min="0" 
      max="1" 
      step="0.01" 
      :value="volume" 
      @input="updateVolume($event)" 
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  volume: number
}>();

const emit = defineEmits<{
  (e: 'volume-change', volume: number): void
}>();

// 根据音量大小显示不同的图标
const volumeIcon = computed(() => {
  if (props.volume === 0) {
    return ['fas', 'volume-xmark'];
  } else if (props.volume < 0.5) {
    return ['fas', 'volume-low'];
  } else {
    return ['fas', 'volume-high'];
  }
});

// 更新音量并发送事件
const updateVolume = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newVolume = parseFloat(target.value);
  emit('volume-change', newVolume);
};
</script>

<style scoped>
.volume-control {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.volume-control svg {
  color: var(--color-primary);
  font-size: 1.2rem;
  width: 1.5rem;
  text-align: center;
}

.volume-control input {
  width: 100px;
}
</style> 