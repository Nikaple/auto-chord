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
            <div class="group-label">其他</div>
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

        <!-- 转位按钮组 -->
        <div class="chord-group">
          <div class="group-row">
            <div class="group-label">转位</div>
            <div class="group-buttons">
              <button 
                :class="{ active: chordStore.currentInversion === 0 }" 
                @click="handleInversion(0)">
                原位
                <span class="shortcut-badge">⇧+Q</span>
              </button>
              <button 
                :class="{ active: chordStore.currentInversion === 1 }" 
                @click="handleInversion(1)">
                转1
                <span class="shortcut-badge">Q</span>
              </button>
              <button 
                :class="{ active: chordStore.currentInversion === 2 }" 
                @click="handleInversion(2)">
                转2
                <span class="shortcut-badge">Q</span>
              </button>
              <button 
                :class="{ active: chordStore.currentInversion === 3 }" 
                @click="handleInversion(3)">
                转3
                <span class="shortcut-badge">Q</span>
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
            :class="{ 'active': isKeyActive(key), 'hidden': key === 'hidden' }"
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
const blackKeys = ['e', 'r', 'hidden', 'y', 'u', 'i'];

// 记录鼠标按下的键
const mouseActiveKey = ref<string | null>(null);

// 检查和弦类型是否激活
function isChordTypeActive(type: ChordType): boolean {
  return activeChordType.value === type;
}

// 获取和弦标签显示
function getChordLabel(mapping: { root: string, type: ChordType, octave?: number } | undefined): string {
  if (!mapping) return '';
  
  // 获取基础和弦信息
  const rootNote = formatNoteName(mapping.root);
  
  // 基于当前修饰键状态预览和弦类型
  let previewType = mapping.type;
  
  // 如果有激活的和弦类型，优先使用它
  if (activeChordType.value !== null) {
    previewType = activeChordType.value;
  }
  
  // 创建和弦并应用当前转位设置
  const chord = new Chord(mapping.root, mapping.octave || 4, previewType);
  chord.setInversion(chordStore.currentInversion);
  return chord.getInversionNotation();
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
  if (key === 'hidden') return '';
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

// 添加转位处理函数
function handleInversion(inversion: number) {
  if (inversion === 0) {
    // 重置为原位
    chordStore.handleInversion(true);
  } else {
    // 设置到指定转位
    while (chordStore.currentInversion !== inversion) {
      chordStore.handleInversion(false);
    }
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
  left: calc(100% / 8 - 100% / 24); /* 调整黑键起始位置 */
  width: 100%;
  height: 85%;
  pointer-events: none;
  display: flex;
  justify-content: flex-start;
}

.black-key {
  position: relative;
  width: calc(100% / 12); /* 黑键宽度从1/16改为1/12 */
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
  margin-right: calc(100% / 24); /* 间距也相应调整 */
}

.black-key:last-child {
  margin-right: 0;
}

.black-key.hidden {
  visibility: hidden;
  pointer-events: none;
  width: calc(100% / 8); /* 一个白键的宽度 */
  margin-right: 0; /* 不需要额外边距 */
}

.black-key:hover {
  background: var(--key-black-hover);
}

.black-key.active {
  background-color: var(--key-black-active);
}

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
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
  padding: 15px;
  background-color: var(--color-background);
  border-radius: 8px;
  align-items: flex-start;
  overflow-x: auto; /* 允许横向滚动 */
  scrollbar-width: none; /* Firefox隐藏滚动条 */
  -ms-overflow-style: none; /* IE和Edge隐藏滚动条 */
}

/* Webkit浏览器隐藏滚动条 */
.modifier-status::-webkit-scrollbar {
  display: none;
}

/* 和弦组样式 */
.chord-group {
  flex: 1;
  min-width: 150px;  /* 减小最小宽度，让转位按钮组更紧凑 */
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
}

.group-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  overflow-x: auto; /* 允许横向滚动 */
  scrollbar-width: none; /* Firefox隐藏滚动条 */
  -ms-overflow-style: none; /* IE和Edge隐藏滚动条 */
}

/* Webkit浏览器隐藏滚动条 */
.group-row::-webkit-scrollbar {
  display: none;
}

.group-label {
  font-size: 0.8rem;
  color: var(--color-text-light);
  font-weight: 500;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-start;  /* 改为左对齐 */
  overflow-x: auto; /* 允许横向滚动 */
  scrollbar-width: none; /* Firefox隐藏滚动条 */
  -ms-overflow-style: none; /* IE和Edge隐藏滚动条 */
}

/* Webkit浏览器隐藏滚动条 */
.group-buttons::-webkit-scrollbar {
  display: none;
}

/* 按钮样式调整 */
.modifier-status button {
  padding: 4px 8px;
  border-radius: 4px;
  background-color: var(--control-background);
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--control-text);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  min-width: 36px;
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

/* 快捷键标签样式 */
.shortcut-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 0.6rem;
  padding: 1px 3px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  color: var(--color-text-light);
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .modifier-status {
    padding: 10px;
    gap: 8px;
  }

  .chord-group {
    padding: 8px;
    min-width: 150px;
  }

  .group-row {
    gap: 6px;
  }

  .group-buttons {
    gap: 4px;
  }

  .group-label {
    font-size: 0.75rem;
    padding: 3px 6px;
  }

  .modifier-status button {
    padding: 3px 6px;
    font-size: 0.8rem;
    min-width: 32px;
  }

  /* 在移动端隐藏快捷键标签 */
  .shortcut-badge {
    display: none;
  }

  /* 在移动端隐藏键盘控制说明 */
  .keyboard-help {
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
    padding-bottom: 12px;
  }

  .seventh-key {
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


/* 转位按钮激活状态 */
.group-buttons button.active {
  background-color: var(--control-background-active);
  color: var(--control-text-active);
}

/* 快捷键提示样式 */
.shortcut-badge {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-left: 4px;
}
</style> 