<template>
  <div class="keyboard-container">
    <div class="piano-layout">
      <!-- 标准钢琴键盘（第一、二排） -->
      <div class="keyboard">
        <div 
          v-for="key in pianoKeys" 
          :key="key"
          class="key" 
          :class="{ 
            'black-key': isBlackKey(chordMapping[key]?.root), 
            'white-key': !isBlackKey(chordMapping[key]?.root),
            'active': isKeyActive(key)
          }"
          @mousedown="playChord(chordMapping[key])">
          <span class="note-name">{{ getChordLabel(chordMapping[key]) }}</span>
          <span class="key-label">{{ key.toUpperCase() }}</span>
        </div>
      </div>
      
      <!-- 第三排 七和弦 -->
      <div class="keyboard-row">
        <div 
          v-for="key in thirdRowKeys" 
          :key="key"
          class="key seventh-key" 
          :class="{ 'active': isKeyActive(key) }"
          @mousedown="playChord(chordMapping[key])">
          <span class="note-name">{{ getChordLabel(chordMapping[key]) }}</span>
          <span class="key-label">{{ key.toUpperCase() }}</span>
        </div>
      </div>
    </div>
    
    <div class="keyboard-help">
      <p>按住键盘上相应的字母键播放和弦。</p>
      
      <p>第二排键位 (A-L) 映射到C大调的基础和弦：</p>
      <div class="chord-map">
        <span><strong>A</strong>: C大调</span>
        <span><strong>S</strong>: D小调</span>
        <span><strong>D</strong>: E小调</span>
        <span><strong>F</strong>: F大调</span>
        <span><strong>G</strong>: G大调</span>
        <span><strong>H</strong>: A小调</span>
        <span><strong>J</strong>: B减七</span>
      </div>
      
      <p>第一排键位 (W/E/T/Y/U/O/P) 映射到特殊和弦：</p>
      <div class="chord-map">
        <span><strong>W</strong>: C#减三</span>
        <span><strong>E</strong>: D#增三</span>
        <span><strong>T</strong>: F#减三</span>
        <span><strong>Y</strong>: G#减三</span>
        <span><strong>U</strong>: A#大调</span>
        <span><strong>O</strong>: C#减三</span>
        <span><strong>P</strong>: D#减三</span>
      </div>
      
      <p>第三排键位 (Z-M) 映射到C大调的七和弦：</p>
      <div class="chord-map">
        <span><strong>Z</strong>: Cmaj7</span>
        <span><strong>X</strong>: Dm7</span>
        <span><strong>C</strong>: Em7</span>
        <span><strong>V</strong>: Fmaj7</span>
        <span><strong>B</strong>: G7</span>
        <span><strong>N</strong>: Am7</span>
        <span><strong>M</strong>: Bm7b5</span>
      </div>
      
      <p>使用修饰键改变和弦类型：</p>
      <ul>
        <li><strong>Shift</strong>: 转换大小调性质</li>
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
import { useKeyboardHandler } from '@/composables/useKeyboardHandler'
import { Chord, ChordType } from '@/utils/music';

// 使用键盘处理器
const { currentChord, chordMapping, activeKeys } = useKeyboardHandler();

// 第三排七和弦按键
const thirdRowKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

// 钢琴键盘布局 - 第一、二排
const pianoKeys = [
  'a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';'
];

// 获取和弦后缀显示
function getChordSuffix(type: ChordType): string {
  switch (type) {
    case ChordType.MAJOR: return '';  // 大三和弦没有后缀
    case ChordType.MINOR: return 'm'; // 小三和弦显示m
    case ChordType.DIMINISHED: return 'dim'; // 减三和弦显示dim
    case ChordType.AUGMENTED: return 'aug'; // 增三和弦显示aug
    case ChordType.SUSPENDED_SECOND: return 'sus2';
    case ChordType.SUSPENDED_FOURTH: return 'sus4';
    case ChordType.DOMINANT_SEVENTH: return '7';
    case ChordType.MAJOR_SEVENTH: return 'maj7';
    case ChordType.MINOR_SEVENTH: return 'm7';
    case ChordType.HALF_DIMINISHED_SEVENTH: return 'm7b5'; // 半减七和弦显示m7b5
    case ChordType.SIXTH: return '6';
    case ChordType.MINOR_SIXTH: return 'm6';
    case ChordType.NINTH: return '9';
    default: return '';
  }
}

// 获取和弦标签显示
function getChordLabel(mapping: { root: string, type: ChordType } | undefined): string {
  if (!mapping) return '';
  return `${mapping.root}${getChordSuffix(mapping.type)}`;
}

// 检查是否是黑键
function isBlackKey(noteName: string | undefined): boolean {
  if (!noteName) return false;
  return noteName.includes('#') || noteName.includes('b');
}

// 检查键是否活跃 - 修改为使用activeKeys而不是检查和弦音符
const isKeyActive = (key: string) => {
  return activeKeys.value.includes(key);
};

// 获取音符的等价名称（例如C#=Db）
function getNoteEquivalent(note: string): string {
  const equivalents: Record<string, string> = {
    'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };
  
  return equivalents[note] || note;
}

// 使用鼠标点击播放和弦
function playChord(mapping: { root: string, type: ChordType } | undefined) {
  if (!mapping || !currentChord.value?.audioSystem) return;
  
  // 映射到对应的和弦
  const octave = 4; // 默认八度
  const newChord = new Chord(mapping.root, octave, mapping.type);
  currentChord.value.audioSystem.playChord(newChord);
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

.piano-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 900px;
  gap: 10px;
}

.keyboard {
  display: flex;
  justify-content: center;
  position: relative;
  height: 180px;
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 第三排七和弦键盘 */
.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 5px;
  width: 100%;
  margin-top: 15px;
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

.seventh-key {
  background-color: #4a6072;
  color: white;
  border: 1px solid #384857;
  width: calc(100% / 7 - 10px);
  height: 80px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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

.chord-map {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  margin: 0.5rem 0 1rem;
  background-color: #f0f0f0;
  padding: 0.5rem;
  border-radius: 4px;
}
</style> 