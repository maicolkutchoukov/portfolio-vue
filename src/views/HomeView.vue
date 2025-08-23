<template>
  <main id="main">
    <HeroSection />
    <FeaturedSection :featured="featured" :isNDA="isNDA" :isPublic="isPublic" />
    <ServicesSection />
    <PortfolioSection />
    <AboutSection />
    <QuoteSection />
    <ContactSection />
  </main>
</template>

<script setup>
import HeroSection from '../components/HeroSection.vue'
import FeaturedSection from '../components/FeaturedSection.vue'
import ServicesSection from '../components/ServicesSection.vue'
import PortfolioSection from '../components/PortfolioSection.vue'
import AboutSection from '../components/AboutSection.vue'
import QuoteSection from '../components/QuoteSection.vue'
import ContactSection from '../components/ContactSection.vue'
import { ref, computed, onMounted } from 'vue'
import site from '../site.config.js'

// stato
const projects = ref([])
const activeTag = ref(new URLSearchParams(location.search).get('tag')?.toLowerCase() || '')

const isNDA = (p) => p?.nda || (p?.type || '').toLowerCase() === 'case_study'
const isPublic = (p) => !isNDA(p) && (!!p?.url || (p?.type || '').toLowerCase() === 'public')

// featured
const featured = computed(() => {
  if (!projects.value.length) return null
  return projects.value.find(p => p.featured) || projects.value[0]
})

// tags
const allTags = computed(() => {
  const set = new Set()
  projects.value.forEach(p => (p.tags || []).forEach(t => set.add(String(t).toLowerCase())))
  return Array.from(set).sort()
})

const filtered = computed(() => {
  if (!activeTag.value) return projects.value
  return projects.value.filter(p => (p.tags || []).map(t => String(t).toLowerCase()).includes(activeTag.value))
})

const setTag = (t) => {
  activeTag.value = t.toLowerCase()
  const u = new URL(location.href)
  if (activeTag.value) u.searchParams.set('tag', activeTag.value)
  else u.searchParams.delete('tag')
  u.hash = 'portfolio'
  history.replaceState(null, '', u.toString())
}

// form
const form = ref({ name: '', email: '', message: '', website: '' })
const onSubmit = () => {
  if (form.value.website) return // honeypot
  if (!form.value.name || !form.value.email || !form.value.message) {
    alert('Per favore, compila tutti i campi obbligatori.')
    return
  }
  // simulazione invio
  alert('Grazie! Ti risponderò a breve.')
  form.value = { name: '', email: '', message: '', website: '' }
}

onMounted(async () => {
  try {
    const res = await fetch('/data/projects.json', { cache: 'force-cache' })
    projects.value = (await res.json()) || []
  } catch (e) {
    console.error('Errore caricando projects.json', e)
  }
})
</script>

<style scoped>
/* opzionale: niente, usiamo lo styles.css globale */
</style>
