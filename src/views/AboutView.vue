<template>
  <div class="container">
    <h1>关于自动和弦</h1>
    
    <div class="about-content">
      <section>
        <h2>项目介绍</h2>
        <p>自动和弦是一个交互式网页应用，允许用户通过键盘按键或按键组合来播放不同的音乐和弦。该应用旨在为音乐学习者、作曲家和音乐爱好者提供一个便捷的和弦演奏工具，帮助他们探索和学习不同的和弦结构。</p>
      </section>
      
      <section>
        <h2>如何使用</h2>
        <p>使用键盘按键播放各种和弦：</p>
        <ul>
          <li>按下对应的字母键播放基础和弦</li>
          <li>使用修饰键（Shift, Ctrl, Alt）改变和弦类型</li>
          <li>调整音色和音量设置以获得最佳听觉体验</li>
        </ul>
      </section>
      
      <section>
        <h2>技术实现</h2>
        <p>本项目使用以下技术栈：</p>
        <ul>
          <li>Vue 3 + TypeScript - 前端框架</li>
          <li>Tone.js - Web音频处理库</li>
          <li>Pinia - 状态管理</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-content {
  max-width: 800px;
}

section {
  margin-bottom: 2rem;
}

h2 {
  margin-top: 1rem;
}

ul {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

li {
  margin-bottom: 0.5rem;
}
</style> 