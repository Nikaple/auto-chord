<template>
  <div class="keyboard-container">
    <div class="keyboard">
      <div v-for="(note, key) in keyboardMapping" :key="key" 
           class="key" 
           :class="{ 
             'black-key': note.includes('#'), 
             'white-key': !note.includes('#'),
             'active': isKeyActive(note)
           }"
           @mousedown="playNote(note)">
        <span class="note-name">{{ note }}</span>
        <span class="key-label">{{ key }}</span>
      </div>
    </div>
    
    <div class="keyboard-help">
      <p>按住键盘上相应的字母键播放音符。</p>
      <p>使用修饰键改变和弦类型：</p>
      <ul>
        <li><strong>Shift</strong>: 小调和弦</li>
        <li><strong>Ctrl</strong>: sus4 和弦</li>
        <li><strong>Alt</strong>: sus2 和弦</li>
        <li><strong>Shift + Ctrl</strong>: 属七和弦</li>
        <li><strong>Shift + Alt</strong>: 大七和弦</li>
        <li><strong>Ctrl + Alt</strong>: 小七和弦</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKeyboardHandler } from '@/composables/useKeyboardHandler'
import { Chord, Note } from '@/utils/music';

// 键盘映射
const keyboardMapping = {
  'A': 'C', 'W': 'C#', 'S': 'D', 'E': 'D#', 'D': 'E',
  'F': 'F', 'T': 'F#', 'G': 'G', 'Y': 'G#', 'H': 'A',
  'U': 'A#', 'J': 'B', 'K': 'C', 'O': 'C#', 'L': 'D',
  'P': 'D#', ';': 'E'
};

// 使用键盘处理器
const { currentChord } = useKeyboardHandler();

// 检查键是否活跃
const isKeyActive = (note: string) => {
  if (!currentChord.value) return false;
  
  return currentChord.value.notes.some(chordNote => 
    chordNote.name === note || 
    // 处理同音异名的情况，例如C#和Db
    (note.includes('#') && getNoteEquivalent(note) === chordNote.name)
  );
};

// 获取音符的等价名称（例如C#=Db）
function getNoteEquivalent(note: string): string {
  const equivalents: Record<string, string> = {
    'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };
  
  return equivalents[note] || note;
}

// 使用鼠标点击播放音符
function playNote(note: string) {
  if (currentChord.value) {
    // 简单地触发该音符的和弦
    // 在实际应用中，这里可能需要更复杂的逻辑
    const newChord = new Chord(note, 4); // 默认使用4八度，可以根据需要调整
    currentChord.value.audioSystem.playChord(newChord);
  }
}
</script>

<style scoped>
.keyboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
}

.keyboard {
  display: flex;
  justify-content: center;
  position: relative;
  height: 180px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.key {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 1rem;
  cursor: pointer;
  transition: all 0.1s ease;
  border-radius: 0 0 4px 4px;
}

.white-key {
  background-color: white;
  border: 1px solid #ddd;
  width: calc(100% / 10);
  height: 100%;
  z-index: 1;
}

.black-key {
  background-color: #333;
  width: calc((100% / 10) * 0.7);
  height: 60%;
  margin-left: calc((100% / 10) * -0.35);
  margin-right: calc((100% / 10) * -0.35);
  z-index: 2;
  color: white;
}

.note-name {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.key-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.active {
  background-color: var(--color-primary);
  color: white;
}

.keyboard-help {
  width: 100%;
  max-width: 600px;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.keyboard-help ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style> 