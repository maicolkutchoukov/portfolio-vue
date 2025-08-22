<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <strong>{{ site.author }}</strong><br />
          <small>{{ site.tagline }}</small>
        </div>
        <div class="footer-links">
          <a href="#portfolio">Portfolio</a>
          <a href="#about">Chi sono</a>
          <a href="#contatti">Contatti</a>
          <RouterLink to="/privacy">Privacy</RouterLink>
        </div>
        <div class="social">
          <a href="#" aria-label="GitHub">GitHub</a>
          <a href="#" aria-label="LinkedIn">LinkedIn</a>
          <a href="mailto:hello@example.com" aria-label="Email">Email</a>
        </div>
      </div>
      <p class="copyright">© <span>{{ year }}</span> {{ site.author }} — Tutti i diritti riservati.</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ site: { type: Object, required: true } })
const year = computed(() => new Date().getFullYear())
</script>
