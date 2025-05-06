<template>
  <div class="app">
    <AudioInitializer />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AudioInitializer from '@/components/AudioInitializer.vue'

</script>

<style>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 0;
}
</style> 