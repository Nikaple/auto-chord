<template>
  <div class="chord-display">
    <h2>当前和弦</h2>
    
    <div v-if="currentChord" class="chord-info">
      <div class="chord-name">{{ getShortChordName(currentChord) }}</div>
      
      <div class="chord-notes">
        <span>音符：</span>
        <span class="note" v-for="(note, index) in currentChord.noteNames" :key="index">
          {{ getShortNoteName(note) }}
        </span>
      </div>
      
      <div class="chord-type">
        <span>类型：</span>
        <span class="chord-type-label">{{ getShortChordTypeLabel(currentChord.type) }}</span>
      </div>
    </div>
    
    <div v-else class="no-chord">
      <p>点击或按键播放和弦</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChordType, Chord } from '@/utils/music'
import { useChordStore } from '@/stores/chordStore'
import { computed } from 'vue'

// 使用和弦 store
const chordStore = useChordStore()
const currentChord = computed(() => chordStore.currentChord)
const modifiers = computed(() => chordStore.modifiers)

// 获取简短的和弦名称
function getShortChordName(chord: Chord): string {
  const name = chord.name;
  return name.replace('major seventh', 'M7')
            .replace('major', 'maj')
            .replace('minor', 'm')
            .replace('diminished', 'dim')
            .replace('augmented', 'aug')
            .replace('seventh', '7');
}

// 获取简短的音符名称
function getShortNoteName(note: string): string {
  return note.replace('sharp', '#')
            .replace('flat', 'b');
}

// 检查指定的和弦类型是否激活
function isTypeActive(typeName: string): boolean {
  if (!currentChord.value) return false;
  return currentChord.value.type === ChordType[typeName as keyof typeof ChordType];
}

// 获取简短的和弦类型标签
function getShortChordTypeLabel(type: ChordType): string {
  const typeLabels: Record<string, string> = {
    'major': 'M',
    'minor': 'm',
    'diminished': 'dim',
    'augmented': 'aug',
    'sus2': 'sus2',
    'sus4': 'sus4',
    '7': '7',
    'M7': 'M7',
    'min7': 'm7',
    '6': '6',
    'min6': 'm6',
    '9': '9',
    'm7b5': 'm7b5'
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

.chord-type {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.chord-type-label {
  font-weight: bold;
  color: var(--color-primary);
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

/* 移动端优化 */
@media (max-width: 768px) {
  .chord-display {
    max-width: 100%;
  }
  
  h2 {
    font-size: 1.2rem;
  }
  
  .chord-info {
    gap: 0.8rem;
  }
  
  .chord-name {
    font-size: 1.8rem;
  }
  
  .note {
    font-size: 0.8rem;
  }
}
</style> 