# 自动和弦 (Auto Chord)

自动和弦是一个交互式网页应用，允许用户通过键盘按键或按键组合来播放不同的音乐和弦。该应用旨在为音乐学习者、作曲家和音乐爱好者提供一个便捷的和弦演奏工具，帮助他们探索和学习不同的和弦结构。

## 功能特点

- 通过键盘按键播放和弦
- 使用修饰键（Shift, Ctrl, Alt）改变和弦类型
- 实时显示当前播放的和弦和包含的音符
- 可调整音色、音量和ADSR包络参数
- 现代响应式UI设计

## 技术栈

- Vue 3 + TypeScript - 前端框架
- Tone.js - Web音频处理库
- Pinia - 状态管理
- Vite - 构建工具

## 开发设置

### 前提条件

- Node.js (v16.0.0+)
- npm (v8.0.0+)

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm run test
```

## 使用说明

使用键盘上的按键来播放和弦：

### 第二排键位 (S-K) 映射到C大调的基础和弦：
- **S**: C大调 (I级)
- **D**: D小调 (ii级)
- **F**: E小调 (iii级)
- **G**: F大调 (IV级)
- **H**: G大调 (V级)
- **J**: A小调 (vi级)
- **K**: B减七 (viio级)

### 第一排键位 (E/R/Y/U/I) 映射到特殊和弦：
- **E**: C#减三和弦
- **R**: D#增三和弦
- **Y**: F#减三和弦
- **U**: G#减三和弦
- **I**: A#大三和弦

### 第三排键位 (Z-M) 映射到C大调的七和弦：
- **Z**: Cmaj7 (I级大七和弦)
- **X**: Dm7 (ii级小七和弦)
- **C**: Em7 (iii级小七和弦)
- **V**: Fmaj7 (IV级大七和弦)
- **B**: G7 (V级属七和弦)
- **N**: Am7 (vi级小七和弦)
- **M**: Bm7b5 (vii级半减七和弦)

### 修饰键组合：
- **Shift**: 转换大小调性质（大调变小调，小调变大调）
- **Ctrl**: 将和弦转为suspended fourth (sus4)
- **Alt**: 将和弦转为suspended second (sus2)
- **Shift + Ctrl**: 播放属七和弦 (dominant seventh)
- **Shift + Alt**: 播放大七和弦 (major seventh)
- **Ctrl + Alt**: 播放小七和弦 (minor seventh)

## 许可

ISC License

