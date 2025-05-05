<template>
  <div class="keyboard-container">
    <div class="piano-layout">
      <!-- 修饰键状态显示 -->
      <div class="modifier-status">
        <span :class="{ active: modifiers.shift }" @click="toggleModifier('shift')">Shift</span>
        <span :class="{ active: modifiers.ctrl }" @click="toggleModifier('ctrl')">Ctrl</span>
        <span :class="{ active: modifiers.alt }" @click="toggleModifier('alt')">Alt</span>
        <div class="chord-info" v-if="currentChord">
          <strong>{{ getChordDisplayName(currentChord) }}</strong>
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
      
      <!-- 第三排七和弦 -->
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
import { useChordStore } from '@/stores/chordStore'

// 使用和弦 store
const chordStore = useChordStore()
const currentChord = computed(() => chordStore.currentChord)

// 使用键盘处理器
const { 
  handleKeyDown,
  handleKeyUp,
  modifiers
} = useKeyboardHandler();

// 当前修饰键状态的计算属性，使其在模板中可响应
const shift = computed(() => modifiers.value.shift);
const ctrl = computed(() => modifiers.value.ctrl);
const alt = computed(() => modifiers.value.alt);

// 当前活跃的键（用于UI显示）
const activeKeysUI = computed(() => Array.from(chordStore.pressedKeys))

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
  const initAudio = async () => {
    try {
      await chordStore.initAudio();
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
    window.removeEventListener('click', initAudio);
    window.removeEventListener('keydown', initAudio);
    window.removeEventListener('touchstart', initAudio);
  };

  window.addEventListener('click', initAudio, { once: true });
  window.addEventListener('keydown', initAudio, { once: true });
  window.addEventListener('touchstart', initAudio, { once: true });

  window.addEventListener('keydown', preventDefaultKeys, true);
  
  // 检测是否为移动设备
  isMobileDevice.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 添加事件监听器
  window.addEventListener('keydown', chordStore.handleKeyDown);
  window.addEventListener('keyup', chordStore.handleKeyUp);
  
  // 页面失去焦点时停止所有声音
  window.addEventListener('blur', () => {
    chordStore.stopChord();
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', preventDefaultKeys, true);
  window.removeEventListener('keydown', chordStore.handleKeyDown);
  window.removeEventListener('keyup', chordStore.handleKeyUp);
  window.removeEventListener('blur', () => {
    chordStore.stopChord();
  });
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

// 获取和弦映射
const chordMapping = computed(() => chordStore.KEY_TO_CHORD);

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
  return activeKeysUI.value.includes(key) || mouseActiveKey.value === key;
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
  if (!mapping || !chordStore.isAudioInitialized) return;
  
  // 如果键盘已经激活，不重复触发
  if (mouseActiveKey.value === key) return;
  
  // 设置当前激活的按键
  mouseActiveKey.value = key;
  chordStore.pressedKeys.add(key);
  
  // 应用修饰符并播放和弦
  const chord = chordStore.applyModifiers(mapping);
  chordStore.playChord(chord);
}

// 鼠标抬起处理函数
function handleMouseUp() {
  if (mouseActiveKey.value) {
    chordStore.pressedKeys.delete(mouseActiveKey.value);
  }
  
  // 停止播放并清除状态
  chordStore.stopChord();
  
  // 清除鼠标激活的按键
  mouseActiveKey.value = null;
}

// 触摸事件处理
function handleTouchStart(key: string, mapping: { root: string, type: ChordType } | undefined) {
  handleMouseDown(key, mapping);
}

function handleTouchEnd() {
  handleMouseUp();
}

// 修饰键状态切换
function toggleModifier(modifier: 'shift' | 'ctrl' | 'alt') {
  if (isMobileDevice.value) {
    const newModifiers = { ...chordStore.modifiers };
    newModifiers[modifier] = !newModifiers[modifier];
    chordStore.setModifiers(newModifiers);
    
    // 如果当前有按键被按下，更新和弦
    if (mouseActiveKey.value) {
      const mapping = chordMapping.value[mouseActiveKey.value];
      if (mapping) {
        const chord = chordStore.applyModifiers(mapping);
        chordStore.playChord(chord);
      }
    }
  }
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

// 获取和弦显示名称
function getChordDisplayName(chord: Chord | null): string {
  if (!chord) return '';
  return chord.name;
}

// 获取和弦类型后缀
function getChordTypeSuffix(type: ChordType): string {
  switch (type) {
    case ChordType.MAJOR: return '';
    case ChordType.MINOR: return 'm';
    case ChordType.DIMINISHED: return 'dim';
    case ChordType.AUGMENTED: return 'aug';
    case ChordType.SUSPENDED_SECOND: return 'sus2';
    case ChordType.SUSPENDED_FOURTH: return 'sus4';
    case ChordType.DOMINANT_SEVENTH: return '7';
    case ChordType.MAJOR_SEVENTH: return 'maj7';
    case ChordType.MINOR_SEVENTH: return 'm7';
    case ChordType.HALF_DIMINISHED_SEVENTH: return 'm7b5';
    default: return '';
  }
}
</script>

<style scoped>
.keyboard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.piano-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  gap: 10px;
}

.keyboard {
  position: relative;
  height: 200px;
  width: 100%;
  background: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 白键布局 */
.white-keys {
  display: flex;
  height: 100%;
  width: 100%;
}

.white-key {
  flex: 1;
  height: 100%;
  background: white;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 20px;
  position: relative;
  z-index: 1;
}

.white-key:last-child {
  border-right: none;
}

/* 黑键布局 */
.black-keys {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 85%;
  pointer-events: none;
}

.black-key {
  position: absolute;
  width: 8%;
  height: 70%;
  background: #333;
  border-radius: 0 0 4px 4px;
  z-index: 2;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 20px;
  color: white;
}

/* 黑键位置 */
.black-key[data-note="C#"] { left: 10.7%; }
.black-key[data-note="D#"] { left: 25%; }
.black-key[data-note="F#"] { left: 53.6%; }
.black-key[data-note="G#"] { left: 67.9%; }
.black-key[data-note="A#"] { left: 82.2%; }

/* 按键文字样式 */
.note-name {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.key-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 按键激活状态 */
.white-key.active {
  background-color: var(--color-primary);
  color: white;
}

.black-key.active {
  background-color: var(--color-primary);
}

/* 第三排和弦键盘 */
.keyboard-row {
  display: flex;
  gap: 5px;
  width: 100%;
}

.seventh-key {
  flex: 1;
  height: 80px;
  background-color: #4a6072;
  color: white;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 15px;
}

.seventh-key.active {
  background-color: var(--color-primary);
}

/* 修饰键状态显示 */
.modifier-status {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.modifier-status span {
  padding: 5px 15px;
  border-radius: 4px;
  background-color: #e0e0e0;
  font-size: 0.9rem;
  font-weight: bold;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modifier-status span.active {
  background-color: var(--color-primary);
  color: white;
}

.chord-info {
  margin-left: auto;
  padding: 5px 15px;
  background-color: #e9f7ff;
  border-radius: 4px;
  color: #2c3e50;
  min-width: 60px;
  text-align: center;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .keyboard-container {
    padding: 15px;
  }

  .keyboard {
    height: 180px;
  }

  .seventh-key {
    height: 70px;
  }
}

@media (max-width: 768px) {
  .keyboard-container {
    padding: 8px;
  }

  .piano-layout {
    gap: 8px;
  }

  .keyboard {
    height: 150px;
  }

  .black-key {
    width: 9%;
    padding-bottom: 12px;
  }

  .white-key {
    padding-bottom: 12px;
  }

  .seventh-key {
    height: 55px;
    padding-bottom: 8px;
  }

  .note-name {
    font-size: 0.75rem;
    margin-bottom: 3px;
  }

  .key-label {
    font-size: 0.65rem;
  }

  .modifier-status {
    gap: 10px;
    padding: 8px;
  }

  .modifier-status span {
    padding: 4px 10px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .keyboard-container {
    padding: 4px;
  }

  .piano-layout {
    gap: 4px;
  }

  .keyboard {
    height: 130px;
  }

  .black-key {
    width: 8%;
    padding-bottom: 8px;
  }

  .white-key {
    padding-bottom: 8px;
  }

  .seventh-key {
    height: 45px;
    padding-bottom: 6px;
  }

  .note-name {
    font-size: 0.7rem;
    margin-bottom: 2px;
  }

  .key-label {
    font-size: 0.6rem;
  }

  .modifier-status {
    gap: 6px;
    padding: 6px;
    margin-bottom: 8px;
  }

  .modifier-status span {
    padding: 3px 8px;
    font-size: 0.75rem;
  }

  .chord-info {
    padding: 3px 8px;
    min-width: 40px;
    font-size: 0.75rem;
  }
}

/* 确保所有元素使用 border-box */
*, *:before, *:after {
  box-sizing: border-box;
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
</style> 