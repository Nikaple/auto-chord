<template>
  <div class="keyboard-container">
    <div class="piano-layout">
      <!-- 修饰键状态显示 -->
      <div class="modifier-status">
        <span :class="{ active: shift }" @click="toggleModifier('shift')">Shift</span>
        <span :class="{ active: ctrl }" @click="toggleModifier('ctrl')">Ctrl</span>
        <span :class="{ active: alt }" @click="toggleModifier('alt')">Alt</span>
        <div class="chord-info">
          <strong>{{ currentChord ? currentChord.name : '无' }}</strong>
        </div>
      </div>
      
      <!-- 标准钢琴键盘 -->
      <div class="keyboard">
        <!-- 白键 -->
        <div class="white-keys">
          <div 
            v-for="key in whiteKeys" 
            :key="key"
            class="key white-key" 
            :class="{ 'active': isKeyActive(key) }"
            @mousedown="handleMouseDown(key, chordMapping[key])"
            @mouseup="handleMouseUp()"
            @mouseleave="handleMouseUp()"
            @touchstart.prevent="handleTouchStart(key, chordMapping[key])"
            @touchend.prevent="handleTouchEnd()"
            @touchcancel.prevent="handleTouchEnd()">
            <span class="note-name">{{ getChordLabel(chordMapping[key]) }}</span>
            <span class="key-label">{{ key.toUpperCase() }}</span>
          </div>
        </div>
        
        <!-- 黑键 -->
        <div class="black-keys">
          <div 
            v-for="key in blackKeys" 
            :key="key"
            class="key black-key" 
            :class="{ 'active': isKeyActive(key) }"
            :data-note="getNoteFromKey(key)"
            @mousedown="handleMouseDown(key, chordMapping[key])"
            @mouseup="handleMouseUp()"
            @mouseleave="handleMouseUp()"
            @touchstart.prevent="handleTouchStart(key, chordMapping[key])"
            @touchend.prevent="handleTouchEnd()"
            @touchcancel.prevent="handleTouchEnd()">
            <span class="note-name">{{ getChordLabel(chordMapping[key]) }}</span>
            <span class="key-label">{{ key.toUpperCase() }}</span>
          </div>
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
          @mouseleave="handleMouseUp()"
          @touchstart.prevent="handleTouchStart(key, chordMapping[key])"
          @touchend.prevent="handleTouchEnd()"
          @touchcancel.prevent="handleTouchEnd()">
          <span class="note-name">{{ getChordLabel(chordMapping[key]) }}</span>
          <span class="key-label">{{ key.toUpperCase() }}</span>
        </div>
      </div>
    </div>
    
    <div class="keyboard-help" v-if="!isMobileDevice">
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
import * as Tone from 'tone';

// 使用键盘处理器
const { 
  currentChord, 
  chordMapping, 
  activeKeys, 
  audioSystem, 
  modifiers,
  handleKeyDown,
  handleKeyUp 
} = useKeyboardHandler();

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
  // 等待用户第一次交互后再初始化音频系统
  const initAudio = () => {
    Tone.start();  // 使用 Tone.start() 替代 audioSystem.init()
    window.removeEventListener('click', initAudio);
    window.removeEventListener('keydown', initAudio);
    window.removeEventListener('touchstart', initAudio);
  };

  window.addEventListener('click', initAudio);
  window.addEventListener('keydown', initAudio);
  window.addEventListener('touchstart', initAudio);

  window.addEventListener('keydown', preventDefaultKeys, true);
  
  // 检测是否为移动设备
  isMobileDevice.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 添加事件监听器
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  
  // 页面失去焦点时停止所有声音
  window.addEventListener('blur', () => {
    currentChord.value = null;
    audioSystem.stopAll();
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', preventDefaultKeys, true);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});

// 第三排七和弦按键
const thirdRowKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

// 分离白键和黑键
const whiteKeys = ['s', 'd', 'f', 'g', 'h', 'j', 'k'];
const blackKeys = ['e', 'r', 'y', 'u', 'i'];

// 记录鼠标按下的键
const mouseActiveKey = ref<string | null>(null);

// 检测是否为移动设备
const isMobileDevice = ref(false);

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
  
  // 应用修饰符创建最终和弦
  const modifiedChord = new Chord(
    mapping.root,
    4, // 默认八度
    modifiers.value.shift && modifiers.value.ctrl ? ChordType.DOMINANT_SEVENTH :
    modifiers.value.shift && modifiers.value.alt ? ChordType.MAJOR_SEVENTH :
    modifiers.value.ctrl && modifiers.value.alt ? ChordType.MINOR_SEVENTH :
    modifiers.value.shift ? (mapping.type === ChordType.MAJOR ? ChordType.MINOR : ChordType.MAJOR) :
    modifiers.value.ctrl ? ChordType.SUSPENDED_FOURTH :
    modifiers.value.alt ? ChordType.SUSPENDED_SECOND :
    mapping.type
  );
  
  // 更新当前和弦状态
  currentChord.value = modifiedChord;
  
  // 播放对应的和弦
  audioSystem.playChord(modifiedChord);
}

// 鼠标抬起处理函数
function handleMouseUp() {
  // 立即停止所有声音
  audioSystem.stopAll();
  
  // 清除鼠标激活的按键
  mouseActiveKey.value = null;
  
  // 清除当前和弦状态
  currentChord.value = null;
}

// 修饰键状态切换
function toggleModifier(modifier: 'shift' | 'ctrl' | 'alt') {
  if (isMobileDevice.value) {
    modifiers.value[modifier] = !modifiers.value[modifier];
    
    // 如果当前有按键被按下，更新和弦
    if (mouseActiveKey.value) {
      const key = mouseActiveKey.value;
      const mapping = chordMapping[key];
      if (mapping) {
        const modifiedChord = applyModifiers(mapping);
        currentChord.value = modifiedChord;
        audioSystem.playChord(modifiedChord);
      }
    }
  }
}

// 触摸事件处理
function handleTouchStart(key: string, mapping: { root: string, type: ChordType } | undefined) {
  handleMouseDown(key, mapping);
}

function handleTouchEnd() {
  handleMouseUp();
}

// 获取音符名称
function getNoteFromKey(key: string): string {
  const noteMap: Record<string, string> = {
    'e': 'C#',
    'r': 'D#',
    'y': 'F#',
    'u': 'G#',
    'i': 'A#'
  };
  return noteMap[key] || '';
}
</script>

<style scoped>
.keyboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.piano-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
}

.keyboard {
  display: flex;
  position: relative;
  height: 180px;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: #f5f5f5;
}

/* 白键容器 */
.white-keys {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

/* 黑键容器 */
.black-keys {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60%;
  pointer-events: none;
  display: flex;
  justify-content: center;
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
  box-sizing: border-box;
}

.white-key {
  flex: 1;
  background-color: white;
  border-right: 1px solid #ddd;
  height: 100%;
  z-index: 1;
  margin: 0;
  padding: 0;
}

.white-key:last-child {
  border-right: none;
}

.black-key {
  background-color: #333;
  width: 70%;
  height: 100%;
  z-index: 2;
  color: white;
  border: 1px solid #000;
  border-radius: 0 0 4px 4px;
  pointer-events: auto;
  position: absolute;
}

/* 设置每个黑键的位置 */
.black-key[data-note="C#"] { left: 12%; }
.black-key[data-note="D#"] { left: 26%; }
.black-key[data-note="F#"] { left: 55%; }
.black-key[data-note="G#"] { left: 69%; }
.black-key[data-note="A#"] { left: 83%; }

.note-name {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  z-index: 3;
}

.key-label {
  font-size: 0.8rem;
  opacity: 0.8;
  z-index: 3;
}

/* 第三排七和弦键盘 */
.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 5px;
  width: 100%;
  margin-top: 15px;
}

.seventh-key {
  background-color: #4a6072;
  color: white;
  border: 1px solid #384857;
  width: calc(100% / 7 - 10px);
  height: 80px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 1rem;
}

.active {
  background-color: var(--color-primary);
  color: white;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .keyboard {
    height: var(--key-height-mobile);
  }

  .note-name {
    font-size: 0.7rem;
  }

  .key-label {
    font-size: 0.6rem;
  }

  .black-key {
    width: 60%;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .key {
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .key:active {
    transform: translateY(1px);
  }
}

.keyboard-help {
  width: 100%;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-top: 2rem;
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