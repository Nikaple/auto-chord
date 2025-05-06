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
        <!-- 三和弦组 -->
        <div class="chord-group">
          <div class="group-row">
            <div class="group-label">三和弦</div>
            <div class="group-buttons">
              <button :class="{ active: isChordTypeActive(ChordType.MINOR) }" @click.prevent="handleNumberKey('1')">
                m
                <span class="shortcut-badge">1</span>
              </button>
              <button :class="{ active: isChordTypeActive(ChordType.MAJOR) }" @click.prevent="handleNumberKey('1', true)">
                M
                <span class="shortcut-badge">⇧+1</span>
              </button>
              <button :class="{ active: isChordTypeActive(ChordType.SUSPENDED_FOURTH) }" @click.prevent="handleNumberKey('2')">
                sus4
                <span class="shortcut-badge">2</span>
              </button>
              <button :class="{ active: isChordTypeActive(ChordType.SUSPENDED_SECOND) }" @click.prevent="handleNumberKey('2', true)">
                sus2
                <span class="shortcut-badge">⇧+2</span>
              </button>
              <button :class="{ active: isChordTypeActive(ChordType.DIMINISHED) }" @click.prevent="handleNumberKey('6')">
                dim
                <span class="shortcut-badge">6</span>
              </button>
              <button :class="{ active: isChordTypeActive(ChordType.AUGMENTED) }" @click.prevent="handleNumberKey('6', true)">
                aug
                <span class="shortcut-badge">⇧+6</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 七和弦组 -->
        <div class="chord-group">
          <div class="group-row">
            <div class="group-label">七和弦</div>
            <div class="group-buttons">
              <button :class="{ active: isChordTypeActive(ChordType.MINOR_SEVENTH) }" @click.prevent="handleNumberKey('3')">
                m7
                <span class="shortcut-badge">3</span>
              </button>
              <button :class="{ active: isChordTypeActive(ChordType.MAJOR_SEVENTH) }" @click.prevent="handleNumberKey('3', true)">
                M7
                <span class="shortcut-badge">⇧+3</span>
              </button>
              <button :class="{ active: isChordTypeActive(ChordType.DOMINANT_SEVENTH) }" @click.prevent="handleNumberKey('4')">
                7
                <span class="shortcut-badge">4</span>
              </button>
              <button :class="{ active: isChordTypeActive(ChordType.MINOR_MAJOR_SEVENTH) }" @click.prevent="handleNumberKey('4', true)">
                mM7
                <span class="shortcut-badge">⇧+4</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 其他和弦组 -->
        <div class="chord-group">
          <div class="group-row">
            <div class="group-label">其他和弦</div>
            <div class="group-buttons">
              <button :class="{ active: isChordTypeActive(ChordType.MINOR_SIXTH) }" @click.prevent="handleNumberKey('5')">
                m6
                <span class="shortcut-badge">5</span>
              </button>
              <button :class="{ active: isChordTypeActive(ChordType.SIXTH) }" @click.prevent="handleNumberKey('5', true)">
                6
                <span class="shortcut-badge">⇧+5</span>
              </button>
              <button :class="{ active: isChordTypeActive(ChordType.MINOR_NINTH) }" @click.prevent="handleNumberKey('7')">
                m9
                <span class="shortcut-badge">7</span>
              </button>
              <button :class="{ active: isChordTypeActive(ChordType.MAJOR_NINTH) }" @click.prevent="handleNumberKey('7', true)">
                9
                <span class="shortcut-badge">⇧+7</span>
              </button>
            </div>
          </div>
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
      <p>键盘控制说明：</p>
      <ul>
        <li><strong>1</strong>: 小三和弦 / <strong>⇧+1</strong>: 大三和弦</li>
        <li><strong>2</strong>: sus4和弦 / <strong>⇧+2</strong>: sus2和弦</li>
        <li><strong>3</strong>: 小七和弦 / <strong>⇧+3</strong>: 大七和弦</li>
        <li><strong>4</strong>: 属七和弦 / <strong>⇧+4</strong>: 小大七和弦</li>
        <li><strong>5</strong>: 小六和弦 / <strong>⇧+5</strong>: 大六和弦</li>
        <li><strong>6</strong>: 减三和弦 / <strong>⇧+6</strong>: 增三和弦</li>
        <li><strong>7</strong>: 小九和弦 / <strong>⇧+7</strong>: 大九和弦</li>
      </ul>
      <p>白键（S D F G H J K L）和黑键（E R Y U I）用于播放和弦。</p>
      <p>第三排（Z X C V B N M ,）用于播放七和弦。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useKeyboardHandler } from '@/composables/useKeyboardHandler'
import { Chord, ChordType, ALL_NOTES } from '@/utils/music';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useChordStore } from '@/stores/chordStore'
import { getChordTypeLabel, getChordSuffix, formatNoteName } from '@/utils/chordUtils'

// 使用和弦 store
const chordStore = useChordStore()
const currentChord = computed(() => chordStore.currentChord)
const currentKey = computed({
  get: () => chordStore.currentKey,
  set: (value) => chordStore.transpose(value)
})
const activeChordType = computed(() => chordStore.activeChordType)

// 使用键盘处理器
const { 
  isMobileDevice,
  chordMapping
} = useKeyboardHandler();

// 当前活跃的键（用于UI显示）
const activeKeysUI = computed(() => Array.from(chordStore.pressedKeys))

// 阻止默认键盘事件
function preventDefaultKeys(e: KeyboardEvent) {
  // 阻止数字键 1-9 的默认行为
  if (e.code.startsWith('Digit')) {
    e.preventDefault();
    return;
  }
}

// 挂载和卸载全局事件监听器
onMounted(() => {
  // 添加事件监听器
  const handleKeyDownWithPrevent = (e: KeyboardEvent) => {
    preventDefaultKeys(e);  // 先阻止默认行为
    chordStore.handleKeyDown(e);
  };
  
  window.addEventListener('keydown', handleKeyDownWithPrevent);
  window.addEventListener('keyup', chordStore.handleKeyUp);
  
  // 页面失去焦点时停止所有声音，但保留和弦显示
  window.addEventListener('blur', () => {
    chordStore.stopChord();
  });
  
  // 保存事件处理函数引用
  (window as any).__handleKeyDownWithPrevent = handleKeyDownWithPrevent;
});

onUnmounted(() => {
  // 使用保存的事件处理函数引用
  window.removeEventListener('keydown', (window as any).__handleKeyDownWithPrevent);
  window.removeEventListener('keyup', chordStore.handleKeyUp);
  window.removeEventListener('blur', () => {
    chordStore.stopChord();
  });
  
  // 清理引用
  delete (window as any).__handleKeyDownWithPrevent;
});

// 第三排七和弦按键
const thirdRowKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ','];

// 分离白键和黑键
const whiteKeys = ['s', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
const blackKeys = ['e', 'r', 'y', 'u', 'i'];

// 记录鼠标按下的键
const mouseActiveKey = ref<string | null>(null);

// 检查和弦类型是否激活
function isChordTypeActive(type: ChordType): boolean {
  return activeChordType.value === type;
}

// 获取和弦标签显示
function getChordLabel(mapping: { root: string, type: ChordType } | undefined): string {
  if (!mapping) return '';
  
  // 获取基础和弦信息
  const rootNote = formatNoteName(mapping.root);
  
  // 基于当前修饰键状态预览和弦类型
  let previewType = mapping.type;
  
  // 如果有激活的和弦类型，优先使用它
  if (activeChordType.value !== null) {
    previewType = activeChordType.value;
  }
  
  return `${rootNote}${getChordSuffix(previewType)}`;
}

// 检查键是否活跃 - 修改为包含键盘和鼠标激活的按键
const isKeyActive = (key: string) => {
  return activeKeysUI.value.includes(key) || mouseActiveKey.value === key;
};

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

// 处理数字键点击
function handleNumberKey(key: string, withShift: boolean = false) {
  chordStore.handleNumberKey(key, withShift);
  
  // 如果当前有鼠标激活的按键，更新它的和弦
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
  flex-direction: column;
  gap: 15px;
  margin-bottom: 15px;
  padding: 15px;
  background-color: var(--color-background);
  border-radius: 8px;
}

/* 和弦组样式 */
.chord-group {
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
}

.group-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-label {
  font-size: 0.8rem;
  color: var(--color-text-light);
  font-weight: 500;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  white-space: nowrap;
}

.group-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

/* 按钮样式调整 */
.modifier-status button {
  padding: 5px 10px;
  border-radius: 4px;
  background-color: var(--control-background);
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--control-text);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  min-width: 40px;
  text-align: center;
  border: none;
  outline: none;
  position: relative;
  flex: 0 0 auto;
}

.modifier-status button:hover {
  background-color: var(--control-background-hover);
}

.modifier-status button.active {
  background-color: var(--control-background-active);
  color: var(--control-text-active);
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .modifier-status {
    padding: 10px;
    gap: 10px;
  }

  .chord-group {
    padding: 8px;
  }

  .group-row {
    gap: 8px;
    flex-direction: column;
    align-items: flex-start;
  }

  .group-buttons {
    gap: 6px;
    width: 100%;
  }

  .group-label {
    font-size: 0.75rem;
  }

  .modifier-status button {
    padding: 4px 8px;
    font-size: 0.8rem;
  }
}

/* 快捷键角标样式 */
.shortcut-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: rgba(0, 0, 0, 0.1);  /* 改用半透明黑色背景 */
  color: var(--color-text);  /* 使用主题文字颜色 */
  font-size: 0.65rem;
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: normal;
  opacity: 0.85;
  border: 1px solid rgba(0, 0, 0, 0.1);  /* 添加细边框增加辨识度 */
}

/* 激活状态下的角标样式 */
button.active .shortcut-badge {
  background-color: rgba(255, 255, 255, 0.2);  /* 激活时使用半透明白色背景 */
  color: var(--control-text-active);  /* 使用激活状态的文字颜色 */
  border-color: rgba(255, 255, 255, 0.2);
}

/* 鼠标悬停时的角标样式 */
.modifier-status button:hover .shortcut-badge {
  background-color: rgba(0, 0, 0, 0.15);  /* 悬停时稍微加深背景 */
}

/* 移动端隐藏快捷键提示 */
@media (max-width: 768px) {
  .shortcut-badge {
    display: none;
  }
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