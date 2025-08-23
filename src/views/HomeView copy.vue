<template>
  <main id="main">
    <!-- HERO -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <p class="eyebrow">Disponibile per nuove collaborazioni!</p>
          <h1>
            Creo prodotti digitali
            <span class="accent">veloci</span>, <span class="accent">accessibili</span>
            e <span class="accent">memorabili</span>.
          </h1>
          <p class="lead">Sviluppatore PHP/Frontend. Dal concept al lancio: UX, performance, SEO e componenti riutilizzabili.</p>
          <div class="cta">
            <a class="btn primary" href="#contatti">Parliamo del tuo progetto</a>
            <a class="btn ghost" href="#portfolio">Vedi il portfolio</a>
          </div>
          <ul class="badges" aria-label="Competenze principali">
            <li>PHP 7/8</li><li>Laravel / Slim</li><li>MySQL</li><li>JS / Vue / React</li><li>UX • SEO • Performance</li>
          </ul>
        </div>
        <div class="hero-media">
          <figure class="card-3d">
            <img src="/assets/img/avatar.jpg" :alt="`Ritratto di ${site.author}`" loading="eager" decoding="async" />
          </figure>
        </div>
      </div>
      <div class="hero-bg" aria-hidden="true"></div>
    </section>

    <!-- FEATURED -->
    <section v-if="featured" class="section alt" aria-labelledby="featured-title">
      <div class="container two-col">
        <div>
          <h2 id="featured-title">In evidenza</h2>
          <h3 style="margin-top:6px">{{ featured.title }}</h3>
          <p class="muted" style="margin:8px 0 16px">
            {{ featured.excerpt || (isNDA(featured) ? 'Case study su CRM proprietario: risultati e impatto.' : 'Progetto pubblico con focus su performance e UX.') }}
          </p>

          <template v-if="isNDA(featured)">
            <template v-if="featured.challenge?.length">
              <h4>Challenge</h4>
              <ul class="bullets"><li v-for="(c,i) in featured.challenge" :key="i">{{ c }}</li></ul>
            </template>
            <template v-if="featured.approach?.length">
              <h4 style="margin-top:12px">Approach</h4>
              <ul class="bullets"><li v-for="(a,i) in featured.approach" :key="i">{{ a }}</li></ul>
            </template>
            <template v-if="featured.impact?.length">
              <h4 style="margin-top:12px">Impact</h4>
              <ul class="kpi-list"><li v-for="(i,k) in featured.impact" :key="k"><span class="kpi-badge">{{ i }}</span></li></ul>
            </template>
            <p class="muted" style="margin-top:12px">Per accordi di riservatezza, UI e dati non sono pubblicabili. Posso mostrare <em>demo con dati sintetici</em> su richiesta.</p>
            <div class="cta" style="margin-top:14px">
              <a class="btn secondary" href="mailto:hello@example.com?subject=Richiesta%20demo%20case%20study">Richiedi demo</a>
            </div>
          </template>

          <template v-else>
            <div class="cta">
              <a v-if="featured.url" class="btn secondary" :href="featured.url" target="_blank" rel="noopener">Visita il sito</a>
              <RouterLink v-if="featured.slug" class="btn ghost" :to="`/project/${featured.slug}`">Dettagli progetto</RouterLink>
            </div>
          </template>
        </div>

        <aside class="card" style="padding:0;overflow:hidden">
          <template v-if="isPublic(featured)">
            <a class="card-cover" :href="featured.url || '#'" target="_blank" rel="noopener">
              <img :src="featured.cover || '/assets/img/cover-1.jpg'" :alt="`Anteprima: ${featured.title}`" loading="lazy" decoding="async" />
            </a>
          </template>
          <template v-else>
            <div class="card-cover">
              <img :src="featured.cover || '/assets/img/abstract-kpi.jpg'" alt="Illustrazione astratta del case study" loading="lazy" decoding="async" />
            </div>
          </template>
        </aside>
      </div>
    </section>

    <!-- SERVICES -->
    <section class="section" id="servizi">
      <div class="container">
        <header class="section-head">
          <h2>Come posso aiutarti</h2>
          <p>Dalla strategia al rilascio, con un processo chiaro e iterazioni veloci.</p>
        </header>
        <div class="grid">
          <article class="card" style="grid-column:span 4"><div class="card-body"><h3 class="card-title">Siti & Landing</h3><p class="card-desc">Paginate moderne, veloci e SEO-first. Design responsivo e gestione contenuti snella.</p></div></article>
          <article class="card" style="grid-column:span 4"><div class="card-body"><h3 class="card-title">Web App & Dashboard</h3><p class="card-desc">Architetture scalabili in PHP + JS, componenti riutilizzabili e UX “app-like”.</p></div></article>
          <article class="card" style="grid-column:span 4"><div class="card-body"><h3 class="card-title">Performance & SEO</h3><p class="card-desc">Core Web Vitals, accessibilità e data layer per tracking e analisi affidabili.</p></div></article>
        </div>
      </div>
    </section>

    <!-- PORTFOLIO -->
    <section id="portfolio" class="section" aria-labelledby="portfolio-title">
      <div class="container">
        <header class="section-head">
          <h2 id="portfolio-title">Portfolio</h2>
          <p>Selezione di lavori recenti: <strong>pubblici</strong> e <strong>case study NDA-safe</strong>. Filtra per competenza.</p>

        <div class="tags" role="tablist" aria-label="Filtri portfolio">
          <a class="tag" :class="{ active: activeTag === '' }" href="#portfolio" @click.prevent="setTag('')">Tutti</a>
          <a v-for="t in allTags" :key="t" class="tag" :class="{ active: activeTag === t }" :href="`?tag=${encodeURIComponent(t)}#portfolio`" @click.prevent="setTag(t)">
            #{{ t }}
          </a>
        </div>
        </header>

        <div class="grid">
          <p v-if="filtered.length === 0" class="muted">Nessun progetto disponibile per questo filtro.</p>

          <article v-for="p in filtered" :key="p.title + (p.slug || '')" class="card" data-tilt style="grid-column:span 6">
            <template v-if="isPublic(p)">
              <a class="card-cover" :href="p.url" target="_blank" rel="noopener">
                <img :src="p.cover || '/assets/img/cover-1.jpg'" :alt="`Anteprima: ${p.title}`" loading="lazy" decoding="async" />
              </a>
            </template>
            <template v-else>
              <div class="card-cover">
                <img :src="p.cover || '/assets/img/abstract-kpi.jpg'" alt="Illustrazione astratta del case study" loading="lazy" decoding="async" />
              </div>
            </template>

            <div class="card-body">
              <h3 class="card-title">
                <a v-if="p.url && isPublic(p)" :href="p.url" target="_blank" rel="noopener">{{ p.title }}</a>
                <RouterLink v-else-if="p.slug" :to="`/project/${p.slug}`">{{ p.title }}</RouterLink>
                <template v-else>{{ p.title }}</template>
              </h3>

              <p v-if="p.industry || p.year || p.role" class="muted" style="margin:0 0 6px">
                <template v-if="p.industry">{{ p.industry }}</template>
                <template v-if="p.year"> • {{ p.year }}</template>
                <template v-if="p.role"> • {{ p.role }}</template>
              </p>

              <p v-if="p.excerpt" class="card-desc">{{ p.excerpt }}</p>

              <template v-if="isNDA(p)">
                <ul v-if="p.impact?.length" class="kpi-list"><li v-for="(i,k) in p.impact" :key="k"><span class="kpi-badge">{{ i }}</span></li></ul>
                <ul v-if="p.approach?.length" class="bullets"><li v-for="(a,i) in p.approach" :key="i">{{ a }}</li></ul>
                <p class="muted" style="margin-top:8px">NDA: UI e dati non pubblicabili. <a href="mailto:hello@example.com?subject=Richiesta%20demo%20case%20study">Richiedi demo</a>.</p>
              </template>

              <div v-if="!isNDA(p) && p.url" class="cta" style="margin-top:10px">
                <a class="btn ghost" :href="p.url" target="_blank" rel="noopener">Visita il sito</a>
                <RouterLink v-if="p.slug" class="btn ghost" :to="`/project/${p.slug}`">Dettagli</RouterLink>
              </div>

              <ul v-if="p.tags?.length" class="card-tags" aria-label="Tag progetto">
                <li v-for="(t,i) in p.tags" :key="i">#{{ t }}</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ABOUT -->
    <section id="about" class="section alt" aria-labelledby="about-title">
      <div class="container two-col">
        <div>
          <h2 id="about-title">Chi sono</h2>
          <p>
            Sono <strong>{{ site.author }}</strong>, sviluppatore web specializzato in PHP e frontend.
            Lavoro con team e aziende per progettare prodotti digitali scalabili, veloci e curati nel dettaglio.
          </p>
          <ul class="checks">
            <li>Codice pulito, testabile e maintainable</li>
            <li>Design system e componenti riutilizzabili</li>
            <li>Core Web Vitals e SEO tecnica</li>
          </ul>
          <div class="cta">
            <a class="btn secondary" href="#contatti">Richiedi un preventivo</a>
            <a class="btn ghost" href="#portfolio">Vedi progetti</a>
          </div>
        </div>
        <aside class="facts" aria-label="Metriche sintetiche">
          <div class="fact"><span class="kpi">2+</span><span>anni esperienza</span></div>
          <div class="fact"><span class="kpi">30+</span><span>progetti lanciati</span></div>
          <div class="fact"><span class="kpi">&lt; 1s</span><span>LCP tipico</span></div>
        </aside>
      </div>
    </section>

    <!-- QUOTE -->
    <section class="section" aria-labelledby="quote-title">
      <div class="container">
        <h2 id="quote-title" class="sr-only">Dicono di me</h2>
        <blockquote class="card" style="padding:20px">
          <p style="margin:0 0 8px">“Collaborazione impeccabile: attenzione ai dettagli, performance eccellenti e comunicazione chiara.”</p>
          <footer class="muted">— CTO, settore manifatturiero</footer>
        </blockquote>
      </div>
    </section>

    <!-- CONTACT -->
    <section id="contatti" class="section" aria-labelledby="contact-title">
      <div class="container">
        <header class="section-head">
          <h2 id="contact-title">Hai un progetto in mente?</h2>
          <p>Scrivimi due righe: risponderò con una proposta chiara e tempi definiti.</p>
        </header>
        <form class="contact-form" @submit.prevent="onSubmit" novalidate>
          <div class="form-grid">
            <label><span>Nome</span><input type="text" v-model.trim="form.name" required autocomplete="name" /></label>
            <label><span>Email</span><input type="email" v-model.trim="form.email" required autocomplete="email" inputmode="email" /></label>
            <label class="full"><span>Messaggio</span><textarea rows="5" v-model.trim="form.message" required></textarea></label>
            <input type="text" v-model="form.website" class="hp" tabindex="-1" autocomplete="off" />
          </div>
          <button class="btn primary" type="submit">Invia richiesta</button>
          <p class="form-note">Oppure scrivimi a <a href="mailto:maicol.ktc@gmail.com">maicol.ktc@gmail.com</a></p>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup>
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
