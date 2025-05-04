# 自动和弦在线Web程序

## 项目简介

自动和弦在线Web程序是一个交互式网页应用，允许用户通过键盘按键或按键组合来播放不同的音乐和弦。该应用旨在为音乐学习者、作曲家和音乐爱好者提供一个便捷的和弦演奏工具，帮助他们探索和学习不同的和弦结构。

### 主要功能

- 通过单个按键播放基本和弦（如Q播放C和弦）
- 通过按键组合强制特定和弦性质（如Shift+按键播放大三和弦）
- 直观显示当前播放的和弦和组成音符
- 虚拟钢琴键盘，显示和弦在键盘上的位置
- 可自定义的音频设置（音量、混响等）

## 快速开始

项目仍处于开发阶段。计划支持以下启动方式：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test
```

## 技术栈

计划使用的技术：

- 前端框架：React
- 构建工具：Vite
- 状态管理：React Context + useReducer
- 音频处理：Tone.js
- CSS框架：TailwindCSS
- 类型系统：TypeScript
- 测试工具：Jest + React Testing Library, Cypress

## 项目结构

```
auto_chord/
├── docs/               # 文档
├── project_management/ # 项目管理文件
├── scripts/            # 工具脚本
├── src/                # 源代码
│   ├── components/     # React组件
│   ├── hooks/          # 自定义钩子
│   ├── models/         # 数据模型
│   ├── services/       # 服务（音频等）
│   ├── styles/         # 样式文件
│   └── utils/          # 工具函数
├── tests/              # 测试文件
└── public/             # 静态资源
```

## 贡献指南

项目仍在早期开发阶段，暂未开放贡献。

## 许可证

该项目计划采用MIT许可证。

