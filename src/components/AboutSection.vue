<template>
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
</template>

<script setup>
import site from '../site.config.js'
</script>
