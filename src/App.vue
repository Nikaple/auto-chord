<template>
  <div class="app">
    <AudioInitializer />
    <header>
      <div class="container">
        <nav>
          <router-link to="/">首页</router-link>
          <router-link to="/about">关于</router-link>
        </nav>
      </div>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AudioInitializer from '@/components/AudioInitializer.vue'

</script>

<style>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background-color: var(--color-dark);
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

header .container {
  padding: 0 1rem;
}

nav {
  display: flex;
  gap: 1.5rem;
}

nav a {
  color: white;
  font-weight: 600;
}

nav a:hover {
  color: var(--color-secondary);
}

nav a.router-link-exact-active {
  color: var(--color-secondary);
}

main {
  padding: 2rem 0;
}
</style> 