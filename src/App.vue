<template>
  <div :data-theme="theme">
    <a class="skip-link" href="#main">Salta al contenuto</a>

    <!-- Passa la prop `site` al header -->
    <SiteHeader :site="site" @toggle-theme="toggleTheme" />

    <router-view />

    <!-- Passa la prop `site` anche al footer, se la usa -->
    <SiteFooter :site="site" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import site from './site.config.js'            // <— importa la config
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'

const theme = ref(localStorage.getItem('theme') || 'dark')
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
}
</script>
