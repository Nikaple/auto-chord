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
        <span>{{ getShortChordTypeLabel(currentChord.type) }}</span>
      </div>
      
      <div class="modifiers">
        <span>修饰：</span>
        <div class="modifier-buttons">
          <span class="modifier" :class="{ active: modifiers.shift }">↑</span>
          <span class="modifier" :class="{ active: modifiers.ctrl }">⌃</span>
          <span class="modifier" :class="{ active: modifiers.alt }">⌥</span>
        </div>
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
  return name.replace('major', 'maj')
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

// 获取简短的和弦类型标签
function getShortChordTypeLabel(type: ChordType): string {
  const typeLabels: Record<string, string> = {
    'major': '大三',
    'minor': '小三',
    'diminished': '减三',
    'augmented': '增三',
    'sus2': 'sus2',
    'sus4': 'sus4',
    '7': '属七',
    'maj7': '大七',
    'min7': '小七',
    '6': '大六',
    'min6': '小六',
    '9': '九',
    'm7b5': '半减七'
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
  
  .modifier-buttons {
    gap: 0.3rem;
  }
  
  .modifier {
    font-size: 1rem;
    padding: 0.3rem 0.5rem;
    min-width: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style> 