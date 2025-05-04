<template>
  <div class="chord-display">
    <h2>当前和弦</h2>
    
    <div v-if="currentChord" class="chord-info">
      <div class="chord-name">{{ currentChord.name }}</div>
      
      <div class="chord-notes">
        <span>包含的音符：</span>
        <span class="note" v-for="(note, index) in currentChord.noteNames" :key="index">
          {{ note }}
        </span>
      </div>
      
      <div class="chord-type">
        <span>和弦类型：</span>
        <span>{{ getChordTypeLabel(currentChord.type) }}</span>
      </div>
      
      <div class="modifiers">
        <span>当前修饰键：</span>
        <div class="modifier-buttons">
          <span class="modifier" :class="{ active: modifiers.shift }">Shift</span>
          <span class="modifier" :class="{ active: modifiers.ctrl }">Ctrl</span>
          <span class="modifier" :class="{ active: modifiers.alt }">Alt</span>
        </div>
      </div>
    </div>
    
    <div v-else class="no-chord">
      <p>按下键盘上的按键播放和弦</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useKeyboardHandler } from '@/composables/useKeyboardHandler'
import { ChordType } from '@/utils/music'

// 使用键盘处理器
const { currentChord, modifiers } = useKeyboardHandler();

// 获取和弦类型的中文标签
function getChordTypeLabel(type: ChordType): string {
  const typeLabels: Record<string, string> = {
    'major': '大三和弦',
    'minor': '小三和弦',
    'diminished': '减三和弦',
    'augmented': '增三和弦',
    'sus2': '挂二和弦',
    'sus4': '挂四和弦',
    '7': '属七和弦',
    'maj7': '大七和弦',
    'min7': '小七和弦',
    '6': '大六和弦',
    'min6': '小六和弦',
    '9': '九和弦'
  };
  
  return typeLabels[type] || type;
}
</script>

<style scoped>
.chord-display {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.4rem;
  color: var(--color-dark);
}

.chord-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chord-name {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

.chord-notes {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.note {
  background-color: var(--color-background);
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-family: monospace;
  font-weight: bold;
}

.chord-type, .modifiers {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modifier-buttons {
  display: flex;
  gap: 0.5rem;
}

.modifier {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  background-color: #eee;
  border-radius: 4px;
  font-size: 0.9rem;
  opacity: 0.6;
}

.modifier.active {
  background-color: var(--color-primary);
  color: white;
  opacity: 1;
}

.no-chord {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-style: italic;
  background-color: #f9f9f9;
  border-radius: 4px;
}
</style> 