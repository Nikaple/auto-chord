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

- **A, S, D, F, G, H, J, K, L**：播放对应的音符
- **W, E, T, Y, U, O, P**：播放对应的黑键音符
- **Shift**：将和弦转为小调
- **Ctrl**：将和弦转为suspended fourth (sus4)
- **Alt**：将和弦转为suspended second (sus2)
- **Shift + Ctrl**：播放属七和弦 (dominant seventh)
- **Shift + Alt**：播放大七和弦 (major seventh)
- **Ctrl + Alt**：播放小七和弦 (minor seventh)

## 许可

ISC License

