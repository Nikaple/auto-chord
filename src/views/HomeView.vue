<template>
  <div class="container">
    <h1>自动和弦</h1>
    
    <div class="main-layout">
      <div class="left-section">
        <div class="piano-container">
          <Keyboard />
        </div>
      </div>
      
      <div class="right-section">
        <ChordDisplay class="panel" />
        <SoundSettings class="panel" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Keyboard from '@/components/Keyboard.vue'
import ChordDisplay from '@/components/ChordDisplay.vue'
import SoundSettings from '@/components/SoundSettings.vue'
</script>

<style scoped>
.container {
  width: 100%;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--container-padding-large);
  overflow-x: hidden;
}

.subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-dark);
  margin-bottom: var(--spacing-xl);
}

.main-layout {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
  width: 100%;
}

.left-section {
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */
}

.right-section {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.piano-container {
  width: 100%;
}

.panel {
  width: 100%;
}

/* 响应式布局 */
@media (max-width: var(--breakpoint-large)) {
  .container {
    padding: var(--container-padding-medium);
  }

  .main-layout {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .right-section {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }
  
  .panel {
    flex: 1;
    min-width: var(--panel-min-width);
  }
}

@media (max-width: var(--breakpoint-medium)) {
  .container {
    padding: var(--container-padding-small);
  }

  .main-layout {
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
  }

  .right-section {
    gap: var(--spacing-md);
  }

  .subtitle {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-lg);
  }

  .panel {
    min-width: 100%;
  }
}

@media (max-width: var(--breakpoint-small)) {
  .container {
    padding: var(--container-padding-small);
  }

  .main-layout {
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }

  .right-section {
    gap: var(--spacing-sm);
  }

  .subtitle {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-md);
  }

  h1 {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-sm);
  }
}
</style> 