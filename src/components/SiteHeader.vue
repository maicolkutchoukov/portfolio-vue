<template>
  <header class="site-header" data-elevate>
    <div class="container header-inner">
      <RouterLink class="brand" :to="{ name: 'home' }" aria-label="Home">
        <span class="logo" aria-hidden="true">◆</span>
        <span class="brand-text">{{ site.author }}</span>
      </RouterLink>

      <nav class="nav" aria-label="Principale">
        <button class="nav-toggle" :aria-expanded="open ? 'true' : 'false'" aria-controls="navMenu" @click="toggle">
          <span class="sr-only">Apri menu</span> ☰
        </button>
        <ul id="navMenu" :class="{ open }" @click="handleClick">
          <li><a href="#portfolio">Portfolio</a></li>
          <li><a href="#about">Chi sono</a></li>
          <li><a href="#contatti">Contatti</a></li>
          <li><button class="theme-toggle" aria-label="Cambia tema" @click="$emit('toggle-theme')">🌓</button></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const props = defineProps({
  site: { type: Object, required: true },
  theme: { type: String, default: 'dark' }
})

const open = ref(false)
const toggle = () => (open.value = !open.value)
const handleClick = (e) => {
  if (e.target.closest('a')) open.value = false
}

onMounted(() => {
  // header shadow allo scroll
  const header = document.querySelector('[data-elevate]')
  let lastY = window.scrollY
  const onScroll = () => {
    const y = window.scrollY
    header?.classList.toggle('shadow', y > 10 && y > lastY)
    lastY = y
  }
  window.addEventListener('scroll', onScroll, { passive: true })
})
</script>
