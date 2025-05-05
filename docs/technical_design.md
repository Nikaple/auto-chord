# 自动和弦在线Web程序 - 技术设计文档

## 1. 架构概述

自动和弦在线Web程序将采用前端单页面应用(SPA)架构，主要包含以下几个核心模块：

1. **用户界面模块**：负责渲染UI组件和用户交互
2. **键盘事件处理模块**：捕获和处理键盘输入事件
3. **和弦逻辑模块**：处理和弦理论和音符计算
4. **音频系统模块**：生成和播放音频

### 架构图

```
+--------------------+    +--------------------+
|    用户界面模块     |<-->|  键盘事件处理模块   |
|                    |    |                    |
+--------------------+    +--------------------+
          ^                        |
          |                        v
+--------------------+    +--------------------+
|    音频系统模块     |<---|    和弦逻辑模块     |
|                    |    |                    |
+--------------------+    +--------------------+
```

## 2. 技术栈选择

### 2.1 前端框架

建议使用**Vue.js 3**作为前端框架，原因如下：

- 使用Composition API和Script setup语法提供更好的代码组织和复用
- 响应式系统使状态管理更加直观和高效
- 轻量级设计适合中小型应用
- 丰富的生态系统和活跃的社区支持
- 更平缓的学习曲线和直观的模板语法

### 2.2 状态管理

对于状态管理，建议使用以下方案：

- 组件级状态：Vue的ref和reactive响应式API
- 全局状态：Pinia（Vue 3官方推荐的状态管理库）

### 2.3 音频处理

使用**Web Audio API**作为音频处理的核心技术：

- 浏览器原生支持，无需额外依赖
- 提供低延迟音频处理能力
- 支持音频合成和效果处理
- 可以进行精确的音频时间控制

可考虑使用Tone.js作为Web Audio API的封装库，简化音频处理：

- 提供更易用的API
- 内置多种合成器和效果
- 处理音乐理论相关概念（音符、和弦等）

### 2.4 构建工具

推荐使用**Vite**作为构建工具：

- 与Vue 3生态紧密集成
- 快速的开发服务器和热模块替换
- 高效的生产构建
- 现代ES模块支持
- 简单的配置

### 2.5 测试工具

- 单元测试：Vitest（专为Vite项目设计）
- 组件测试：Vue Test Utils + Vitest
- 端到端测试：Cypress

## 3. 模块设计

### 3.1 用户界面模块

#### 主要组件：

1. **App组件**：应用的根组件，包含全局布局
2. **KeyboardDisplay组件**：显示键盘映射
3. **ChordDisplay组件**：显示当前和弦信息
4. **PianoKeyboard组件**：虚拟钢琴键盘
5. **SettingsPanel组件**：设置面板
6. **HelpSection组件**：帮助和教程区域

#### 响应式设计实现：

1. **CSS变量系统**：
```css
:root {
  /* 断点系统 */
  --breakpoint-small: 480px;    /* 手机 */
  --breakpoint-medium: 768px;   /* 平板 */
  --breakpoint-large: 1024px;   /* 小屏电脑 */
  --breakpoint-xlarge: 1200px;  /* 大屏电脑 */
  
  /* 键盘尺寸 */
  --keyboard-height-small: 130px;    /* 手机 */
  --keyboard-height-medium: 150px;   /* 平板 */
  --keyboard-height-large: 180px;    /* 小屏电脑 */
  --keyboard-height-xlarge: 200px;   /* 大屏电脑 */
}
```

2. **触摸交互优化**：
```typescript
// 统一的事件处理
function handleTouchStart(key: string, mapping: { root: string, type: ChordType }) {
  handleMouseDown(key, mapping);
}

function handleTouchEnd() {
  handleMouseUp();
}

// 移动端修饰键切换
function toggleModifier(modifier: 'shift' | 'ctrl' | 'alt') {
  if (isMobileDevice.value) {
    const newModifiers = { ...chordStore.modifiers };
    newModifiers[modifier] = !newModifiers[modifier];
    chordStore.setModifiers(newModifiers);
  }
}
```

3. **移动端布局适配**：
```css
@media (max-width: 768px) {
  .keyboard {
    height: var(--keyboard-height-small);
  }
  
  .white-key {
    width: calc(100% / 7);
  }
  
  .black-key {
    width: 8%;
  }
  
  .note-name {
    font-size: var(--font-size-xs);
  }
}
```

#### 组件实现示例（Vue 3 + Composition API + Script setup）：

```vue
<!-- ChordDisplay.vue -->
<script setup>
import { ref, computed, watch } from 'vue';
import { useAudioStore } from '@/stores/audio';

// 注入当前和弦状态
const audioStore = useAudioStore();
const currentChord = computed(() => audioStore.currentChord);

// 计算和弦音符显示
const chordNotes = computed(() => {
  if (!currentChord.value) return '无';
  return currentChord.value.notes.map(note => `${note.name}${note.octave}`).join('-');
});

// 计算和弦名称样式
const chordNameClass = computed(() => {
  if (!currentChord.value) return '';
  return `chord-${currentChord.value.type}`;
});
</script>

<template>
  <div class="chord-display">
    <h2>当前和弦</h2>
    <div class="chord-name" :class="chordNameClass">
      {{ currentChord?.root || 'C' }}{{ currentChord?.type || 'major' }}
    </div>
    <div class="chord-notes">
      音符组成: {{ chordNotes }}
    </div>
  </div>
</template>
```

#### 数据流：

- 使用Pinia存储全局状态
- 组件通过计算属性（computed）响应状态变化
- 事件通过方法触发状态变更

### 3.2 键盘事件处理模块

#### 主要功能：

1. **键盘事件监听**：监听keydown和keyup事件
2. **修饰键检测**：检测Shift、Ctrl、Alt等修饰键状态
3. **按键映射**：将键盘按键映射到和弦
4. **组合键处理**：处理修饰键与普通按键的组合

#### 实现思路 (Vue 3 + Composition API)：

```javascript
// useKeyboard.js - 自定义组合式函数
import { ref, onMounted, onUnmounted } from 'vue';
import { useAudioStore } from '@/stores/audio';

// 键盘映射配置
const keyToChordMap = {
  // 第一排 - 基本三和弦
  'q': { root: 'C', type: 'major' },
  'w': { root: 'D', type: 'minor' },
  'e': { root: 'E', type: 'minor' },
  'r': { root: 'F', type: 'major' },
  't': { root: 'G', type: 'major' },
  'y': { root: 'A', type: 'minor' },
  'u': { root: 'B', type: 'diminished' },
  
  // 第二排 - 变化和弦
  'a': { root: 'C♯', type: 'diminished' },
  's': { root: 'D♯', type: 'augmented' },
  'd': { root: 'F♯', type: 'diminished' },
  'f': { root: 'F♯', type: 'augmented' },
  'g': { root: 'G♯', type: 'diminished' },
  'h': { root: 'Bb', type: 'major' },
  
  // 第三排 - 七和弦
  'z': { root: 'C', type: 'major7' },
  'x': { root: 'D', type: 'minor7' },
  'c': { root: 'E', type: 'minor7' },
  'v': { root: 'F', type: 'major7' },
  'b': { root: 'G', type: 'dominant7' },
  'n': { root: 'A', type: 'minor7' },
  'm': { root: 'B', type: 'minor7flat5' }
};

// 修饰键处理
const applyModifiers = (chord, modifiers) => {
  const { shiftKey, ctrlKey, altKey } = modifiers;
  
  if (shiftKey && !ctrlKey && !altKey) {
    // 强制大三和弦
    return { root: chord.root, type: 'major' };
  } else if (ctrlKey && !shiftKey && !altKey) {
    // 强制小三和弦
    return { root: chord.root, type: 'minor' };
  } else if (altKey && !shiftKey && !ctrlKey) {
    // 强制大七和弦
    return { root: chord.root, type: 'major7' };
  } else if (ctrlKey && altKey && !shiftKey) {
    // 强制小七和弦
    return { root: chord.root, type: 'minor7' };
  } else if (shiftKey && altKey && !ctrlKey) {
    // 强制属七和弦
    return { root: chord.root, type: 'dominant7' };
  }
  
  return chord;
};

// 键盘事件处理
export function useKeyboardHandler() {
  const audioStore = useAudioStore();
  const pressedKeys = ref(new Set());
  
  const handleKeyDown = (event) => {
    const { key, shiftKey, ctrlKey, altKey } = event;
    const lowerKey = key.toLowerCase();
    
    // 防止重复触发
    if (pressedKeys.value.has(lowerKey)) return;
    pressedKeys.value.add(lowerKey);
    
    // 确定基础和弦
    const baseChord = keyToChordMap[lowerKey];
    if (!baseChord) return;
    
    // 应用修饰符
    const modifiers = { shiftKey, ctrlKey, altKey };
    const finalChord = applyModifiers(baseChord, modifiers);
    
    // 播放和弦并更新状态
    audioStore.playChord(finalChord);
  };
  
  const handleKeyUp = (event) => {
    const lowerKey = event.key.toLowerCase();
    pressedKeys.value.delete(lowerKey);
    
    // 如果配置为松开键时停止声音
    if (audioStore.settings.stopOnKeyUp) {
      audioStore.stopChord();
    }
  };
  
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  });
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  });
  
  return {
    pressedKeys
  };
}
```

### 3.3 和弦逻辑模块

#### 主要类/函数：

1. **Note类**：表示单个音符，包含音高、频率等信息
2. **Chord类**：表示和弦，包含根音、类型和组成音符
3. **音符计算函数**：根据和弦类型计算组成音符

#### 数据结构：

```javascript
// 伪代码示例
class Note {
  constructor(name, octave) {
    this.name = name; // C, C♯, D, ...
    this.octave = octave; // 0-8
    this.frequency = this.calculateFrequency();
  }
  
  calculateFrequency() {
    // 根据音符名称和八度计算频率
  }
}

class Chord {
  constructor(root, type) {
    this.root = root; // 根音符
    this.type = type; // major, minor, dim, ...
    this.notes = this.calculateNotes();
  }
  
  calculateNotes() {
    // 根据和弦类型计算组成音符
    switch(this.type) {
      case 'major':
        return [
          this.root,
          new Note(this.root.name, this.root.octave + 4), // 大三度 (4半音)
          new Note(this.root.name, this.root.octave + 7)  // 纯五度 (7半音)
        ];
      // ... 其他和弦类型
    }
  }
}
```

### 3.4 音频系统模块

#### 主要功能：

1. **音频上下文管理**：创建和维护Web Audio API上下文
2. **音源生成**：生成单个音符的声音
3. **和弦合成**：将多个音符合成为和弦
4. **音频效果**：添加混响、音量控制等效果

#### 实现思路 (Vue 3 + Composition API)：

```javascript
// useAudio.js - 自定义组合式函数
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import * as Tone from 'tone';
import { defineStore } from 'pinia';

export const useAudioStore = defineStore('audio', () => {
  // 状态
  const currentChord = ref(null);
  const settings = reactive({
    volume: 0,
    reverb: 0.3,
    instrument: 'piano',
    stopOnKeyUp: true
  });
  
  // 音频系统
  let synth = null;
  let reverb = null;
  
  // 初始化音频系统
  const initAudio = async () => {
    await Tone.start();
    
    synth = new Tone.PolySynth(Tone.Synth).toDestination();
    reverb = new Tone.Reverb(settings.reverb).toDestination();
    synth.connect(reverb);
    
    // 设置初始音量
    setVolume(settings.volume);
  };
  
  // 播放和弦
  const playChord = (chord) => {
    if (!synth) return;
    
    // 计算和弦音符
    const notes = calculateChordNotes(chord);
    const noteStrings = notes.map(note => `${note.name}${note.octave}`);
    
    // 播放和弦
    synth.triggerAttackRelease(noteStrings, "2n");
    
    // 更新当前和弦状态
    currentChord.value = {
      ...chord,
      notes
    };
  };
  
  // 停止播放
  const stopChord = () => {
    if (!synth) return;
    synth.releaseAll();
  };
  
  // 设置音量
  const setVolume = (value) => {
    if (!synth) return;
    settings.volume = value;
    synth.volume.value = Tone.gainToDb(value); // 0-1 转换为分贝
  };
  
  // 设置混响
  const setReverb = async (value) => {
    settings.reverb = value;
    if (reverb) {
      reverb.decay = value * 5; // 0-1 转换为 0-5 秒衰减
      await reverb.generate();
    }
  };
  
  // 设置乐器
  const setInstrument = (preset) => {
    if (!synth) return;
    settings.instrument = preset;
    
    // 根据预设更改合成器参数
    const presets = {
      piano: {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.9 }
      },
      organ: {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.3, sustain: 1.0, release: 0.5 }
      },
      guitar: {
        oscillator: { type: 'triangle8' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4 }
      }
    };
    
    if (presets[preset]) {
      synth.set(presets[preset]);
    }
  };
  
  onMounted(() => {
    initAudio();
  });
  
  onUnmounted(() => {
    if (synth) {
      synth.dispose();
    }
    if (reverb) {
      reverb.dispose();
    }
  });
  
  return {
    currentChord,
    settings,
    playChord,
    stopChord,
    setVolume,
    setReverb,
    setInstrument
  };
});
```

## 4. 数据流图

```
用户按键 -> 键盘事件处理 -> 确定基础和弦 -> 应用修饰符 -> 
生成最终和弦 -> 计算和弦音符 -> 音频系统播放 -> 
                                           |
UI状态更新 <- 更新显示组件 <- 分发和弦事件 <-+
```

## 5. API设计

### 5.1 和弦模块API

```javascript
// 音符和和弦类型
interface Note {
  name: string;    // 音符名称 (C, C♯, D等)
  octave: number;  // 八度 (通常3-5)
  frequency: number; // 频率 (Hz)
}

interface Chord {
  root: string;    // 根音 (C, D, E等)
  type: string;    // 和弦类型 (major, minor, diminished等)
  notes?: Note[];  // 组成音符
}

// 和弦工具函数
const createChord = (root, type) => ({ root, type });
const calculateChordNotes = (chord) => Note[]; // 根据和弦计算组成音符

// 和弦修饰函数
const forceChordToMajor = (chord) => ({ ...chord, type: 'major' });
const forceChordToMinor = (chord) => ({ ...chord, type: 'minor' });
const forceChordToMajor7 = (chord) => ({ ...chord, type: 'major7' });
const forceChordToMinor7 = (chord) => ({ ...chord, type: 'minor7' });
const forceChordToDominant7 = (chord) => ({ ...chord, type: 'dominant7' });
```

### 5.2 音频模块API (Pinia Store)

```javascript
// 使用Pinia存储音频状态
export const useAudioStore = defineStore('audio', () => {
  // 状态
  const currentChord = ref(null);  // 当前和弦
  const settings = reactive({      // 音频设置
    volume: 0,
    reverb: 0.3,
    instrument: 'piano',
    stopOnKeyUp: true
  });
  
  // 操作
  const playChord = (chord) => void;  // 播放和弦
  const stopChord = () => void;       // 停止播放
  const setVolume = (value) => void;  // 设置音量
  const setReverb = (value) => void;  // 设置混响
  const setInstrument = (preset) => void; // 设置乐器音色
  
  return {
    // 暴露状态和操作
    currentChord,
    settings,
    playChord,
    stopChord,
    setVolume,
    setReverb,
    setInstrument
  };
});
```

### 5.3 键盘事件模块API

```javascript
// 键盘事件处理组合式API
export function useKeyboardHandler() {
  // 当前按下的键
  const pressedKeys = ref(new Set());
  
  // 处理键盘事件
  const handleKeyDown = (event) => void;
  const handleKeyUp = (event) => void;
  
  // 修饰键状态检查
  const checkModifiers = (event) => ({ shiftKey, ctrlKey, altKey });
  
  // 组件挂载和卸载时自动设置和移除事件监听器
  onMounted(() => void);
  onUnmounted(() => void);
  
  return {
    pressedKeys // 返回当前按下的键集合
  };
}
```

## 6. 存储设计

### 本地存储

使用Vue.js 3 + Composition API结合localStorage存储用户设置和偏好：

```javascript
// useSettings.js
import { ref, watch } from 'vue';

export function useSettings() {
  // 默认设置
  const defaultSettings = {
    volume: 0.7,
    reverb: 0.3,
    instrument: 'piano',
    stopOnKeyUp: true,
    octave: 4
  };
  
  // 创建响应式设置对象
  const settings = ref(loadSettings());
  
  // 保存设置
  function saveSettings() {
    localStorage.setItem('chord-app-settings', JSON.stringify(settings.value));
  }
  
  // 加载设置
  function loadSettings() {
    const saved = localStorage.getItem('chord-app-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  }
  
  // 重置设置
  function resetSettings() {
    settings.value = { ...defaultSettings };
    saveSettings();
  }
  
  // 监视设置变化，自动保存
  watch(settings, () => {
    saveSettings();
  }, { deep: true });
  
  return {
    settings,
    resetSettings
  };
}
```

### 和弦进行存储（扩展功能）

使用Pinia管理和弦进行数据，并与本地存储集成：

```javascript
// useProgressionStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useProgressionStore = defineStore('progressions', () => {
  // 存储所有和弦进行
  const progressions = ref(loadProgressions());
  
  // 当前活动进行
  const activeProgression = ref(null);
  
  // 计算属性：获取和弦进行列表
  const progressionList = computed(() => {
    return progressions.value.map(p => ({
      id: p.id,
      name: p.name,
      created: p.created
    }));
  });
  
  // 加载和弦进行
  function loadProgressions() {
    const saved = localStorage.getItem('chord-app-progressions');
    return saved ? JSON.parse(saved) : [];
  }
  
  // 保存和弦进行
  function saveProgressions() {
    localStorage.setItem('chord-app-progressions', JSON.stringify(progressions.value));
  }
  
  // 添加新和弦进行
  function addProgression(progression) {
    const newProgression = {
      id: Date.now().toString(),
      created: new Date().toISOString(),
      ...progression
    };
    progressions.value.push(newProgression);
    saveProgressions();
    return newProgression.id;
  }
  
  // 设置活动进行
  function setActiveProgression(id) {
    const progression = progressions.value.find(p => p.id === id);
    activeProgression.value = progression || null;
  }
  
  // 删除和弦进行
  function deleteProgression(id) {
    const index = progressions.value.findIndex(p => p.id === id);
    if (index !== -1) {
      progressions.value.splice(index, 1);
      saveProgressions();
      
      if (activeProgression.value?.id === id) {
        activeProgression.value = null;
      }
    }
  }
  
  return {
    progressions,
    activeProgression,
    progressionList,
    addProgression,
    setActiveProgression,
    deleteProgression
  };
});
```

## 7. 性能优化策略

1. **音频预加载**：预先加载和初始化音频资源
2. **事件节流**：对键盘事件进行节流处理，避免过多事件处理
3. **记忆化计算**：缓存频繁使用的和弦计算结果
4. **延迟加载**：非核心功能采用延迟加载
5. **Web Worker**：将复杂计算移至Web Worker线程

## 8. 浏览器兼容性

支持的目标浏览器：

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

关键技术兼容性考虑：

- Web Audio API: 所有现代浏览器都支持，但实现细节可能有差异
- ES6+特性: 使用Babel确保兼容性
- CSS Grid/Flexbox: 所有目标浏览器都有良好支持

## 9. 安全性考虑

1. **内容安全策略**：实施适当的CSP防止XSS攻击
2. **输入验证**：验证所有用户输入（如自定义和弦定义）
3. **安全的本地存储**：不存储敏感信息在本地存储中

## 10. 技术风险评估

| 风险 | 影响 | 可能性 | 缓解策略 |
|------|------|--------|----------|
| 音频延迟过高 | 高 | 中 | 优化音频处理逻辑，使用缓冲策略 |
| 浏览器兼容性问题 | 中 | 中 | 全面的浏览器测试，优雅降级策略 |
| 复杂键盘组合冲突 | 中 | 低 | 设计清晰的键盘映射，提供自定义选项 |
| Web Audio API限制 | 高 | 低 | 在设计阶段确认API能力，实现替代方案 | 