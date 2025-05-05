<template>
  <div class="keyboard-container">
    <div class="piano-layout">
      <!-- 调性选择器 -->
      <div class="key-selector">
        <button class="transpose-btn" @click="handleTransposeDown">♭</button>
        <select v-model="currentKey" @change="handleKeyChange" class="key-select">
          <option v-for="note in ALL_NOTES" :key="note" :value="note">
            {{ note }}
          </option>
        </select>
        <button class="transpose-btn" @click="handleTransposeUp">♯</button>
      </div>

      <!-- 修饰键状态显示 -->
      <div class="modifier-status">
        <button :class="{ active: modifiers.shift && !modifiers.ctrl && !modifiers.alt }" @click.prevent="setChordType('shift')">M/m</button>
        <button :class="{ active: modifiers.ctrl && !modifiers.shift && !modifiers.alt }" @click.prevent="setChordType('ctrl')">sus4</button>
        <button :class="{ active: modifiers.alt && !modifiers.shift && !modifiers.ctrl }" @click.prevent="setChordType('alt')">sus2</button>
        <button :class="{ active: modifiers.shift && modifiers.ctrl && modifiers.alt }" @click.prevent="setChordType('dim')">dim</button>
        <button :class="{ active: modifiers.shift && modifiers.alt && !modifiers.ctrl }" @click.prevent="setChordType('M7')">M7</button>
        <button :class="{ active: modifiers.ctrl && modifiers.alt && !modifiers.shift }" @click.prevent="setChordType('m7')">m7</button>
        <button :class="{ active: modifiers.shift && modifiers.ctrl && !modifiers.alt }" @click.prevent="setChordType('7')">7</button>
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
            <span class="note-name" v-html="getChordLabel(chordMapping[key])"></span>
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
            :style="getBlackKeyPosition(key)"
            @mousedown="handleMouseDown(key, chordMapping[key])"
            @mouseup="handleMouseUp()"
            @mouseleave="handleMouseUp()"
            @touchstart.prevent="handleTouchStart(key, chordMapping[key])"
            @touchend.prevent="handleTouchEnd()"
            @touchcancel.prevent="handleTouchEnd()">
            <span class="note-name" v-html="getChordLabel(chordMapping[key])"></span>
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
          <span class="note-name" v-html="getChordLabel(chordMapping[key])"></span>
          <span class="key-label">{{ key.toUpperCase() }}</span>
        </div>
      </div>
    </div>
    
    <div class="keyboard-help" v-if="!isMobileDevice">
      <p>Modifier keys for chord types:</p>
      <ul>
        <li><strong>Shift</strong>: Toggle Major/Minor</li>
        <li><strong>Ctrl</strong>: sus4 chord</li>
        <li><strong>Alt</strong>: sus2 chord</li>
        <li><strong>Shift + Ctrl</strong>: Dominant 7th</li>
        <li><strong>Shift + Alt</strong>: Major 7th</li>
        <li><strong>Ctrl + Alt</strong>: Minor 7th</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useKeyboardHandler } from '@/composables/useKeyboardHandler'
import { Chord, ChordType, ALL_NOTES } from '@/utils/music';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import * as Tone from 'tone';
import { useChordStore } from '@/stores/chordStore'

// 使用和弦 store
const chordStore = useChordStore()
const currentChord = computed(() => chordStore.currentChord)
const currentKey = computed({
  get: () => chordStore.currentKey,
  set: (value) => chordStore.transpose(value)
})

// 使用键盘处理器
const { 
  handleKeyDown,
  handleKeyUp,
  modifiers,
  isMobileDevice
} = useKeyboardHandler();

// 当前修饰键状态的计算属性，使其在模板中可响应
const shift = computed(() => modifiers.value.shift);
const ctrl = computed(() => modifiers.value.ctrl);
const alt = computed(() => modifiers.value.alt);

// 当前活跃的键（用于UI显示）
const activeKeysUI = computed(() => Array.from(chordStore.pressedKeys))

// 阻止默认键盘事件
function preventDefaultKeys(e: KeyboardEvent) {
  // 阻止Alt键的默认行为
  if (e.key === 'Alt' || e.altKey) {
    e.preventDefault();
    return;
  }
  
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
  // 移除音频初始化相关代码
  window.addEventListener('keydown', preventDefaultKeys, true);
  
  // 添加事件监听器
  window.addEventListener('keydown', chordStore.handleKeyDown);
  window.addEventListener('keyup', chordStore.handleKeyUp);
  
  // 页面失去焦点时停止所有声音，但保留和弦显示
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
const thirdRowKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ','];

// 分离白键和黑键
const whiteKeys = ['s', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
const blackKeys = ['e', 'r', 'y', 'u', 'i'];

// 记录鼠标按下的键
const mouseActiveKey = ref<string | null>(null);

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
    case ChordType.MAJOR_SEVENTH: return 'M7';
    case ChordType.MINOR_SEVENTH: return 'm7';
    case ChordType.HALF_DIMINISHED_SEVENTH: return 'm7b5'; // 半减七和弦显示m7b5
    case ChordType.SIXTH: return '6';
    case ChordType.MINOR_SIXTH: return 'm6';
    case ChordType.NINTH: return '9';
    default: return '';
  }
}

// 格式化音符名称，将升降号转换为专业音乐符号的上下标
function formatNoteName(note: string): string {
  return note
    .replace(/♯/g, '<sup>♯</sup>')
    .replace(/♭/g, '<sub>♭</sub>');
}

// 获取和弦标签显示
function getChordLabel(mapping: { root: string, type: ChordType } | undefined): string {
  if (!mapping) return '';
  
  // 获取基础和弦信息
  const rootNote = formatNoteName(mapping.root);
  
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

// 获取音符的等价名称（例如C♯=D♭）
function getNoteEquivalent(note: string): string {
  const equivalents: Record<string, string> = {
    'C♯': 'D♭', 'D♯': 'E♭', 'F♯': 'G♭', 'G♯': 'A♭', 'A♯': 'B♭',
    'D♭': 'C♯', 'E♭': 'D♯', 'G♭': 'F♯', 'A♭': 'G♯', 'B♭': 'A♯'
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
  
  // 停止播放但不清除和弦显示
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

// 直接设置和弦类型（通过设置对应的修饰键组合）
function setChordType(type: string) {
  const newModifiers = { shift: false, ctrl: false, alt: false };
  
  // 根据选择的类型设置对应的修饰键组合
  switch(type) {
    case 'shift': // 大/小
      newModifiers.shift = true;
      break;
    case 'ctrl': // sus4
      newModifiers.ctrl = true;
      break;
    case 'alt': // sus2
      newModifiers.alt = true;
      // 特殊处理Alt键，防止浏览器默认行为
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Alt') {
          e.preventDefault();
        }
      }, { once: true });
      break;
    case '7': // 属七
      newModifiers.shift = true;
      newModifiers.ctrl = true;
      break;
    case 'M7': // 大七 (修改为M7)
      newModifiers.shift = true;
      newModifiers.alt = true;
      // 特殊处理Alt键
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Alt') {
          e.preventDefault();
        }
      }, { once: true });
      break;
    case 'm7': // 小七
      newModifiers.ctrl = true;
      newModifiers.alt = true;
      // 特殊处理Alt键
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Alt') {
          e.preventDefault();
        }
      }, { once: true });
      break;
    case 'dim': // 减
      newModifiers.shift = true;
      newModifiers.ctrl = true;
      newModifiers.alt = true;
      // 特殊处理Alt键
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Alt') {
          e.preventDefault();
        }
      }, { once: true });
      break;
    default:
      // 如果没有指定类型，则清除所有修饰键
      break;
  }
  
  // 如果当前修饰键状态与要设置的完全相同，则清除所有修饰键
  // 这样可以通过再次点击同一个按钮来取消选择
  if (newModifiers.shift === modifiers.value.shift &&
      newModifiers.ctrl === modifiers.value.ctrl &&
      newModifiers.alt === modifiers.value.alt) {
    newModifiers.shift = false;
    newModifiers.ctrl = false;
    newModifiers.alt = false;
  }
  
  // 更新修饰键状态
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

// 获取音符名称
function getNoteFromKey(key: string): string {
  const noteMap: Record<string, string> = {
    'e': 'C♯',
    'r': 'D♯',
    'y': 'F♯',
    'u': 'G♯',
    'i': 'A♯'
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
    case ChordType.MAJOR_SEVENTH: return 'M7';
    case ChordType.MINOR_SEVENTH: return 'm7';
    case ChordType.HALF_DIMINISHED_SEVENTH: return 'm7b5';
    default: return '';
  }
}

// 获取黑键位置 - 使用data-note属性或style
function getBlackKeyPosition(key: string): Record<string, string> {
  // 由于已经使用data-note属性设置位置，这里可以返回空对象
  return {};
}

// 处理调性变更
function handleKeyChange(event: Event) {
  const select = event.target as HTMLSelectElement
  chordStore.transpose(select.value)
}

// 处理升降调
function handleTransposeUp() {
  chordStore.transposeUp()
}

function handleTransposeDown() {
  chordStore.transposeDown()
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
  user-select: none; /* 禁用文字选择 */
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
  background: var(--color-background);
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

.key {
  cursor: pointer; /* 添加指针样式 */
  user-select: none; /* 禁用文字选择 */
}

.white-key {
  flex: 1;
  height: 100%;
  background: var(--key-white);
  border-right: 1px solid var(--key-border);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 20px;
  position: relative;
  z-index: 1;
  color: var(--key-text);
  transition: all 0.2s ease;
  width: calc(100% / 8); /* 修改为8键布局 */
}

.white-key:hover {
  background: var(--key-white-hover);
}

.white-key:last-child {
  border-right: none;
}

.white-key.active {
  background-color: var(--key-white-active);
  color: var(--key-text-inverted);
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
  background: var(--key-black);
  border-radius: 0 0 4px 4px;
  z-index: 2;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 20px;
  color: var(--key-text-inverted);
  transition: all 0.2s ease;
}

.black-key:hover {
  background: var(--key-black-hover);
}

.black-key.active {
  background-color: var(--key-black-active);
}

/* 黑键位置 */
.black-key[data-note="C♯"] { left: 10.7%; }
.black-key[data-note="D♯"] { left: 22.3%; }
.black-key[data-note="F♯"] { left: 47.3%; }
.black-key[data-note="G♯"] { left: 60.1%; }
.black-key[data-note="A♯"] { left: 72.9%; }

/* 按键文字样式 */
.note-name {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.note-name sup {
  font-size: 0.65em;
  position: relative;
  top: -0.4em;
  margin-left: 1px;
  font-weight: normal;
}

.note-name sub {
  font-size: 0.65em;
  position: relative;
  bottom: -0.2em;
  margin-left: 1px;
  font-weight: normal;
}

.key-label {
  font-size: 0.8rem;
  opacity: 0.8;
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
  background-color: var(--key-seventh);
  color: var(--key-text-inverted);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 15px;
  transition: all 0.2s ease;
  width: calc(100% / 8); /* 修改为8键布局 */
}

.seventh-key:hover {
  background-color: var(--key-seventh-hover);
}

.seventh-key.active {
  background-color: var(--key-seventh-active);
}

/* 修饰键状态显示 */
.modifier-status {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background-color: var(--color-background);
  border-radius: 8px;
  flex-wrap: wrap;
}

.modifier-status button {
  padding: 5px 10px;
  border-radius: 4px;
  background-color: var(--control-background);
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--control-text);
  cursor: pointer;
  user-select: none; /* 禁用文字选择 */
  transition: all 0.2s ease;
  min-width: 40px;
  text-align: center;
  border: none;
  outline: none;
}

.modifier-status button:hover {
  background-color: var(--control-background-hover);
}

.modifier-status button.active {
  background-color: var(--control-background-active);
  color: var(--control-text-active);
}

.chord-info {
  margin-left: auto;
  padding: 5px 15px;
  background-color: var(--color-accent-light);
  border-radius: 4px;
  color: var(--key-text-inverted);
  min-width: 60px;
  text-align: center;
}

/* 调性选择器 */
.key-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
  user-select: none; /* 禁用文字选择 */
}

.key-select {
  padding: 8px 16px;
  font-size: 1.2rem;
  border: 2px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.transpose-btn {
  padding: 8px 16px;
  font-size: 1.2rem;
  border: 2px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  user-select: none; /* 禁用文字选择 */
  transition: all 0.2s;
}

.transpose-btn:hover {
  background-color: var(--control-background-hover);
  border-color: var(--color-primary);
}

.transpose-btn:active {
  transform: translateY(1px);
  background-color: var(--control-background-active);
  color: var(--control-text-active);
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
    width: calc(100% / 8) !important; /* 修改为8键布局 */
  }

  .seventh-key {
    width: calc(100% / 8) !important; /* 修改为8键布局 */
    height: calc(var(--keyboard-height-small) * 0.3) !important;
    font-size: var(--font-size-sm) !important;
  }

  .note-name {
    font-size: 0.75rem;
    margin-bottom: 0;
  }

  .key-label {
    display: none;
  }

  .modifier-status {
    gap: 10px;
    padding: 8px;
  }

  .modifier-status button {
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
    margin-bottom: 0;
  }

  .key-label {
    display: none;
  }

  .modifier-status {
    gap: 6px;
    padding: 6px;
    margin-bottom: 8px;
  }

  .modifier-status button {
    padding: 3px 8px;
    font-size: 0.75rem;
  }

  .chord-info {
    padding: 3px 8px;
    min-width: 40px;
    font-size: 0.75rem;
  }

  .key-selector {
    gap: 4px;
    margin-bottom: 8px;
  }

  .key-select,
  .transpose-btn {
    padding: 4px 8px;
    font-size: 1rem;
  }
}

/* 确保所有元素使用 border-box */
*, *:before, *:after {
  box-sizing: border-box;
}

.keyboard-help {
  user-select: none; /* 禁用文字选择 */
  width: 100%;
  background-color: var(--color-background);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-top: 2rem;
  color: var(--color-text);
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