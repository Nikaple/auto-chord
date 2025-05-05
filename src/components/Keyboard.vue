<template>
  <div class="keyboard-container">
    <div class="piano-layout">
      <!-- 修饰键状态显示 -->
      <div class="modifier-status">
        <span :class="{ active: shift }">Shift</span>
        <span :class="{ active: ctrl }">Ctrl</span>
        <span :class="{ active: alt }">Alt</span>
        <div class="chord-info">
          <span>当前和弦:</span>
          <strong>{{ currentChord ? currentChord.name : '无' }}</strong>
        </div>
      </div>
      
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
          @mousedown="handleMouseDown(key, chordMapping[key])"
          @mouseup="handleMouseUp()"
          @mouseleave="handleMouseUp()">
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
          @mousedown="handleMouseDown(key, chordMapping[key])"
          @mouseup="handleMouseUp()"
          @mouseleave="handleMouseUp()">
          <span class="note-name">{{ getChordLabel(chordMapping[key]) }}</span>
          <span class="key-label">{{ key.toUpperCase() }}</span>
        </div>
      </div>
    </div>
    
    <div class="keyboard-help">
      <p>按住键盘上相应的字母键播放和弦。</p>
      
      <p>第二排键位 (S-K) 映射到C大调的基础和弦：</p>
      <div class="chord-map">
        <span><strong>S</strong>: C大调</span>
        <span><strong>D</strong>: D小调</span>
        <span><strong>F</strong>: E小调</span>
        <span><strong>G</strong>: F大调</span>
        <span><strong>H</strong>: G大调</span>
        <span><strong>J</strong>: A小调</span>
        <span><strong>K</strong>: B减七</span>
      </div>
      
      <p>第一排键位 (E/R/Y/U/I) 映射到特殊和弦：</p>
      <div class="chord-map">
        <span><strong>E</strong>: C#减三</span>
        <span><strong>R</strong>: D#增三</span>
        <span><strong>Y</strong>: F#减三</span>
        <span><strong>U</strong>: G#减三</span>
        <span><strong>I</strong>: A#大调</span>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';

// 使用键盘处理器
const { currentChord, chordMapping, activeKeys, audioSystem, modifiers } = useKeyboardHandler();

// 当前修饰键状态的计算属性，使其在模板中可响应
const shift = computed(() => modifiers.value.shift);
const ctrl = computed(() => modifiers.value.ctrl);
const alt = computed(() => modifiers.value.alt);

// 阻止默认键盘事件
function preventDefaultKeys(e: KeyboardEvent) {
  // 阻止修饰键+字母的默认行为(如Ctrl+A全选, Ctrl+W关闭标签页)
  if (e.ctrlKey && /^[a-z]$/i.test(e.key)) {
    e.preventDefault();
  }
  // 阻止Alt+字母的默认行为
  else if (e.altKey && /^[a-z]$/i.test(e.key)) {
    e.preventDefault();
  }
}

// 挂载和卸载全局事件监听器
onMounted(() => {
  window.addEventListener('keydown', preventDefaultKeys, true);
});

onUnmounted(() => {
  window.removeEventListener('keydown', preventDefaultKeys, true);
});

// 第三排七和弦按键
const thirdRowKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

// 钢琴键盘布局 - 第一、二排（已向右移动一位）
const pianoKeys = [
  's', 'e', 'd', 'r', 'f', 'g', 'y', 'h', 'u', 'j', 'i', 'k'
];

// 记录鼠标按下的键
const mouseActiveKey = ref<string | null>(null);

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
  
  // 获取基础和弦信息
  const rootNote = mapping.root;
  
  // 基于当前修饰键状态预览和弦类型
  let previewType = mapping.type;
  
  // 根据修饰键状态计算和弦类型
  if (shift.value && ctrl.value) {
    // 属七和弦 - 保持根音不变
    previewType = ChordType.DOMINANT_SEVENTH;
  } else if (shift.value && alt.value) {
    // 大七和弦 - 保持根音不变
    previewType = ChordType.MAJOR_SEVENTH;
  } else if (ctrl.value && alt.value) {
    // 小七和弦 - 保持根音不变
    previewType = ChordType.MINOR_SEVENTH;
  } else if (shift.value) {
    // Shift: 大小性质反转
    if (previewType === ChordType.MAJOR) {
      previewType = ChordType.MINOR;
    } else if (previewType === ChordType.MINOR) {
      previewType = ChordType.MAJOR;
    }
  } else if (ctrl.value) {
    // Ctrl: sus4和弦
    previewType = ChordType.SUSPENDED_FOURTH;
  } else if (alt.value) {
    // Alt: sus2和弦
    previewType = ChordType.SUSPENDED_SECOND;
  }
  
  return `${rootNote}${getChordSuffix(previewType)}`;
}

// 检查是否是黑键
function isBlackKey(noteName: string | undefined): boolean {
  if (!noteName) return false;
  return noteName.includes('#') || noteName.includes('b');
}

// 检查键是否活跃 - 修改为包含键盘和鼠标激活的按键
const isKeyActive = (key: string) => {
  return activeKeys.value.includes(key) || mouseActiveKey.value === key;
};

// 获取音符的等价名称（例如C#=Db）
function getNoteEquivalent(note: string): string {
  const equivalents: Record<string, string> = {
    'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };
  
  return equivalents[note] || note;
}

// 鼠标按下处理函数
function handleMouseDown(key: string, mapping: { root: string, type: ChordType } | undefined) {
  if (!mapping) return;
  
  // 如果键盘已经激活，不重复触发
  if (mouseActiveKey.value === key) return;
  
  // 设置当前激活的按键
  mouseActiveKey.value = key;
  
  // 播放对应的和弦
  playChord(mapping);
}

// 鼠标抬起处理函数
function handleMouseUp() {
  // 如果没有键盘按键处于活跃状态，则停止当前和弦
  if (activeKeys.value.length === 0) {
    audioSystem.stopAll();
  }
  
  // 清除鼠标激活的按键
  mouseActiveKey.value = null;
}

// 使用鼠标点击播放和弦
function playChord(mapping: { root: string, type: ChordType } | undefined) {
  if (!mapping) return;
  
  // 映射到对应的和弦
  const octave = 4; // 默认八度
  const newChord = new Chord(mapping.root, octave, mapping.type);
  
  // 使用音频系统播放和弦
  audioSystem.playChord(newChord);
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

.modifier-status {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.modifier-status span {
  padding: 5px 15px;
  border-radius: 4px;
  background-color: #e0e0e0;
  font-size: 0.9rem;
  font-weight: bold;
  color: #555;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.modifier-status span.active {
  background-color: var(--color-primary, #4a6072);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.chord-info {
  margin-left: auto;
  padding: 5px 15px;
  background-color: #e9f7ff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #2c3e50;
  font-size: 0.9rem;
}

.chord-info strong {
  margin-left: 8px;
  font-size: 1.1rem;
  color: #1a5c9a;
}
</style> 