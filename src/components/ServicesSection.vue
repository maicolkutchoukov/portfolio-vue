<template>
  <section class="section" id="servizi">
    <div class="container">
      <header class="section-head">
        <h2>Come posso aiutarti</h2>
        <p>Dalla strategia al rilascio, con un processo chiaro e iterazioni veloci.</p>
      </header>
      <div class="grid">
        <article v-for="s in services" :key="s.title" class="card" style="grid-column:span 4">
          <div class="card-body">
            <h3 class="card-title">{{ s.title }}</h3>
            <p class="card-desc">{{ s.desc }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
const services = [
  { title: "Siti & Landing", desc: "Paginate moderne, veloci e SEO-first. Design responsivo e gestione contenuti snella." },
  { title: "Web App & Dashboard", desc: "Architetture scalabili in PHP + JS, componenti riutilizzabili e UX “app-like”." },
  { title: "Performance & SEO", desc: "Core Web Vitals, accessibilità e data layer per tracking e analisi affidabili." }
]
</script>
