# 自动和弦在线Web程序 - UI设计文档

## 1. 概述

自动和弦在线Web程序的用户界面旨在提供直观、易用的交互体验，帮助用户通过键盘快速播放和学习各种和弦。界面设计遵循简洁、实用的原则，将各功能模块清晰地呈现给用户。

## 2. 设计风格

### 2.1 配色方案

主要配色采用音乐主题相关的色调：

- **主色调**：深蓝色 (#1A365D) - 代表专业和稳定
- **次要色调**：淡紫色 (#7E57C2) - 代表创造和艺术
- **强调色**：亮橙色 (#FF9800) - 用于高亮当前激活的和弦或按键
- **背景色**：浅灰色 (#F5F5F5) - 提供舒适的视觉体验
- **文本色**：深灰色 (#333333) - 确保良好的可读性

### 2.2 字体选择

- 标题：Montserrat（无衬线字体）
- 正文：Open Sans（无衬线字体）
- 音乐符号：Bravura（专业音乐字体）

### 2.3 设计语言

采用扁平化设计风格，结合适当的阴影和过渡效果，提供现代感的用户体验。UI元素使用圆角矩形，按钮和控件采用一致的视觉样式。

## 3. 主要布局设计

应用采用响应式设计，主要布局分为以下几个区域：

```
+-------------------------------------------------------+
|                      顶部导航栏                        |
+-------------------------------------------------------+
|                                                       |
|                      和弦显示区                        |
|                                                       |
+------------------------+----------------------------+
|                        |                            |
|      虚拟钢琴键盘       |        键盘映射区           |
|                        |                            |
+------------------------+----------------------------+
|                                                       |
|                      控制面板区                        |
|                                                       |
+-------------------------------------------------------+
|                       帮助/教程                        |
+-------------------------------------------------------+
```

## 4. 组件详细设计

### 4.1 顶部导航栏

![顶部导航栏线框图](../assets/wireframes/navbar.png)

- **Logo**：左侧放置应用logo
- **标题**：居中显示"自动和弦在线Web程序"
- **设置按钮**：打开设置面板
- **帮助按钮**：打开帮助/教程区域

### 4.2 和弦显示区

![和弦显示区线框图](../assets/wireframes/chord_display.png)

- **当前和弦名称**：大字体显示当前播放的和弦名称（如"C"、"Dm"、"G7"）
- **和弦组成音符**：显示和弦的组成音符（如C-E-G）
- **和弦图形表示**：使用标准的和弦图表示法（可切换钢琴/吉他）

状态反馈：
- 播放和弦时，相关显示元素高亮
- 使用动画效果表示和弦激活状态

### 4.3 虚拟钢琴键盘

![虚拟钢琴键盘线框图](../assets/wireframes/piano_keyboard.png)

- **交互式钢琴键盘**：显示2个八度的钢琴键
- **音符标记**：在每个键上标记音符名称
- **和弦高亮**：当前和弦的音符在键盘上高亮显示
- **音符动画**：按下键时显示动画效果

交互方式：
- 用户可以通过鼠标点击钢琴键播放单个音符
- 当键盘按键触发和弦时，对应的钢琴键同步高亮

### 4.4 和弦触发区（键盘映射区）

![和弦触发区线框图](../assets/wireframes/keyboard_mapping.png)

- **键盘图示**：显示计算机键盘布局
- **映射标记**：在每个键上显示对应的和弦名称，采用标准和弦缩写表示法：
  * 大三和弦：C（无需后缀）
  * 小三和弦：Cm
  * 大七和弦：CM7
  * 小七和弦：Cm7
  * 属七和弦：C7
- **分组显示**：按功能分组显示不同区域的键
  - 第一排（S-K）：基本三和弦
  - 第二排（E-I）：变化和弦（增强、减七等）
  - 第三排（Z-M）：七和弦
- **修饰键说明**：显示修饰键组合的效果
  - Shift：强制大三和弦
  - Ctrl：强制小三和弦
  - Alt：强制大七和弦
  - Ctrl+Alt：强制小七和弦
  - Shift+Alt：强制属七和弦

交互方式：
- 当用户按下实际键盘按键时，对应的和弦按钮高亮显示
- 悬停在和弦按钮上会显示该和弦的完整信息（非缩写形式）
- 使用颜色编码区分不同类型的和弦（如三和弦、七和弦等）

### 4.5 控制面板区

![控制面板线框图](../assets/wireframes/control_panel.png)

- **音量控制**：滑块控制整体音量
- **混响效果**：滑块控制混响效果强度
- **八度选择**：下拉菜单选择和弦的八度位置
- **音色选择**：下拉菜单选择不同的乐器音色
- **切换按钮**：切换不同的键盘映射方案

交互方式：
- 实时音频参数调整
- 保存用户偏好设置

### 4.6 帮助/教程区

![帮助教程区线框图](../assets/wireframes/help_section.png)

- **快速入门**：基本使用说明
- **和弦理论**：简要的和弦理论介绍
- **键盘映射表**：完整的键盘映射参考表
- **常见问题**：FAQ部分

交互方式：
- 可折叠的内容部分
- 分步骤的交互式教程

## 5. 响应式设计

应用采用统一的响应式设计，通过自适应布局确保在不同设备上提供一致的用户体验：

### 5.1 桌面版（>= 1024px）
- 横向布局，充分利用宽屏空间
- 同时显示所有功能区域
- 支持键盘快捷键操作

### 5.2 平板版（768px - 1023px）
- 混合布局，关键组件保持在视口内
- 自适应调整组件大小和间距
- 同时支持触摸和键盘操作

### 5.3 移动版（< 768px）
- 纵向流式布局，确保每个组件都有足够的操作空间
- 优化现有组件的触摸体验：
  - 钢琴键盘：
    - 固定显示一个八度
    - 自适应调整琴键宽度
    - 优化和弦标注显示
  - 和弦触发区：
    - 自适应调整按钮大小
    - 优化触摸响应区域
    - 保持现有的和弦分组（S-K/E-I/Z-M）
  - 控制面板：
    - 自适应调整控件大小
    - 优化触摸操作体验

## 6. 交互设计

所有交互设计采用统一的事件处理机制，自动适应鼠标和触摸操作：

### 6.1 通用交互

| 交互 | 响应 | 设备适应 |
|------|------|----------|
| 点击/触摸和弦按钮 | 播放对应和弦 | 所有设备 |
| 点击/触摸钢琴键 | 播放单个音符 | 所有设备 |
| 长按和弦按钮 | 显示和弦完整信息 | 所有设备 |
| 滑动控制面板 | 调整音频参数 | 所有设备 |
| 双指缩放 | 调整整体视图大小 | 触摸设备 |
| 按键操作 | 触发和弦和修饰功能 | 键盘设备 |

### 6.2 和弦修饰操作

| 设备类型 | 修饰方式 | 说明 |
|----------|----------|------|
| 键盘设备 | 修饰键 | 使用 Shift/Ctrl/Alt 组合 |
| 触摸设备 | 长按/快速切换 | 通过手势或模式切换实现相同功能 |

## 7. 状态反馈设计

为确保良好的用户体验，应用将通过以下方式提供明确的状态反馈：

### 7.1 视觉反馈

- **按键高亮**：当前按下的键在键盘映射区高亮显示
- **和弦高亮**：当前播放的和弦在和弦显示区高亮
- **音符高亮**：当前和弦的音符在虚拟钢琴键盘上高亮
- **加载状态**：音频资源加载中时显示加载指示器

### 7.2 听觉反馈

- **主要反馈**：播放和弦声音
- **操作确认音**：设置更改时播放简短的确认音

## 8. 原型设计

设计原型将通过以下工具实现：

1. 低保真原型：使用线框图工具（如Figma或Sketch）
2. 高保真原型：使用原型设计工具（如Adobe XD或Figma）
3. 交互原型：使用HTML/CSS/JS实现基本功能

## 9. 可访问性设计

应用将遵循WCAG 2.1 AA标准，确保良好的可访问性：

- **键盘导航**：所有功能可通过键盘访问
- **屏幕阅读器支持**：提供适当的ARIA标签
- **色彩对比度**：确保文本和背景之间有足够的对比度
- **文本大小调整**：支持浏览器文本大小调整
- **焦点指示器**：清晰的键盘焦点指示

## 10. 用户测试计划

为验证UI设计的有效性，将进行以下用户测试：

1. **启发式评估**：基于可用性原则评估界面
2. **任务完成测试**：观察用户完成特定任务
3. **满意度调查**：收集用户对界面的主观评价
4. **A/B测试**：比较不同界面设计的效果 