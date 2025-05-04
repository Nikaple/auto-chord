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

建议使用**React**作为前端框架，原因如下：

- 组件化开发方式适合UI拆分和复用
- 虚拟DOM提供高效的UI更新
- 丰富的生态系统和社区支持
- 适合开发复杂交互的单页应用

### 2.2 状态管理

对于状态管理，建议使用以下方案：

- 小型状态：React的useState和useContext钩子
- 复杂状态：Redux或Context API（根据实际复杂度选择）

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

- 快速的开发服务器和热模块替换
- 高效的生产构建
- 现代ES模块支持
- 简单的配置

### 2.5 测试工具

- 单元测试：Jest + React Testing Library
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

#### 数据流：

- UI组件通过Props和Context接收状态
- 用户交互触发事件处理器
- 状态更新后UI重新渲染

### 3.2 键盘事件处理模块

#### 主要功能：

1. **键盘事件监听**：监听keydown和keyup事件
2. **修饰键检测**：检测Shift、Ctrl、Alt等修饰键状态
3. **按键映射**：将键盘按键映射到和弦
4. **组合键处理**：处理修饰键与普通按键的组合

#### 实现思路：

```javascript
// 伪代码示例 - 键盘映射配置
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
  'a': { root: 'C#', type: 'diminished' },
  's': { root: 'D#', type: 'augmented' },
  'd': { root: 'F#', type: 'diminished' },
  'f': { root: 'F#', type: 'augmented' },
  'g': { root: 'G#', type: 'diminished' },
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
function useKeyboardHandler() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, shiftKey, ctrlKey, altKey } = event;
      
      // 确定基础和弦
      const baseChord = keyToChordMap[key.toLowerCase()];
      if (!baseChord) return;
      
      // 应用修饰符
      const modifiers = { shiftKey, ctrlKey, altKey };
      const finalChord = applyModifiers(baseChord, modifiers);
      
      // 触发和弦播放
      playChord(finalChord);
      
      // 更新UI状态
      updateChordDisplay(finalChord);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
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
    this.name = name; // C, C#, D, ...
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

#### 实现思路：

```javascript
// 伪代码示例 - 使用Tone.js
import * as Tone from 'tone';

class AudioSystem {
  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.reverb = new Tone.Reverb(1.5).toDestination();
    this.synth.connect(this.reverb);
  }
  
  playChord(chord) {
    const noteStrings = chord.notes.map(note => `${note.name}${note.octave}`);
    this.synth.triggerAttackRelease(noteStrings, "2n");
  }
  
  setVolume(volume) {
    this.synth.volume.value = Tone.gainToDb(volume); // 0-1 转换为分贝
  }
  
  setInstrument(preset) {
    // 根据预设更改合成器参数
    this.synth.set({
      oscillator: {
        type: preset.oscillatorType
      },
      envelope: preset.envelope
    });
  }
}
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
// 创建和弦
createChord(root, type) -> Chord

// 强制和弦类型
forceChordToMajor(chord) -> Chord
forceChordToMinor(chord) -> Chord
forceChordToMajor7(chord) -> Chord
forceChordToMinor7(chord) -> Chord
forceChordToDominant7(chord) -> Chord

// 和弦映射
getChordByKey(key, modifiers) -> Chord
```

### 5.2 音频模块API

```javascript
// 初始化音频系统
initAudioSystem() -> AudioSystem

// 播放和弦
playChord(chord) -> void

// 停止播放
stopAllNotes() -> void

// 设置音频参数
setVolume(level) -> void
setReverb(level) -> void
setInstrument(preset) -> void
```

### 5.3 键盘事件模块API

```javascript
// 注册键盘事件处理器
useKeyboardHandler(onChordPlay, onChordStop) -> void

// 检查修饰键状态
checkModifiers(event) -> { shift, ctrl, alt }

// 获取当前按下的键
getCurrentPressedKeys() -> Set<string>
```

## 6. 存储设计

### 本地存储

使用浏览器的localStorage存储用户设置和偏好：

```javascript
// 保存设置
const saveSettings = (settings) => {
  localStorage.setItem('chord-app-settings', JSON.stringify(settings));
};

// 加载设置
const loadSettings = () => {
  const saved = localStorage.getItem('chord-app-settings');
  return saved ? JSON.parse(saved) : defaultSettings;
};
```

### 和弦进行存储（扩展功能）

存储格式示例：

```javascript
const chordProgressionData = {
  name: "简单进行",
  author: "用户名",
  created: "2023-06-15",
  chords: [
    { root: "C", type: "major", duration: 1 },
    { root: "G", type: "major", duration: 1 },
    { root: "A", type: "minor", duration: 1 },
    { root: "F", type: "major", duration: 1 }
  ]
};
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