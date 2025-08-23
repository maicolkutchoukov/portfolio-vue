<template>
  <section v-if="featured" class="section alt" aria-labelledby="featured-title">
    <div class="container two-col">
      <div>
        <h2 id="featured-title">In evidenza</h2>
        <h3 style="margin-top:6px">{{ featured.title }}</h3>
        <p class="muted" style="margin:8px 0 16px">
          {{ featured.excerpt || (isNDA(featured) ? 'Case study su CRM proprietario: risultati e impatto.' : 'Progetto pubblico con focus su performance e UX.') }}
        </p>

        <template v-if="isNDA(featured)">
          <h4 v-if="featured.challenge?.length">Challenge</h4>
          <ul v-if="featured.challenge?.length" class="bullets">
            <li v-for="(c,i) in featured.challenge" :key="i">{{ c }}</li>
          </ul>

          <h4 v-if="featured.approach?.length" style="margin-top:12px">Approach</h4>
          <ul v-if="featured.approach?.length" class="bullets">
            <li v-for="(a,i) in featured.approach" :key="i">{{ a }}</li>
          </ul>

          <h4 v-if="featured.impact?.length" style="margin-top:12px">Impact</h4>
          <ul v-if="featured.impact?.length" class="kpi-list">
            <li v-for="(i,k) in featured.impact" :key="k"><span class="kpi-badge">{{ i }}</span></li>
          </ul>

          <p class="muted" style="margin-top:12px">
            Per accordi di riservatezza, UI e dati non sono pubblicabili. Posso mostrare
            <em>demo con dati sintetici</em> su richiesta.
          </p>
          <div class="cta" style="margin-top:14px">
            <a class="btn secondary" href="mailto:hello@example.com?subject=Richiesta%20demo%20case%20study">Richiedi demo</a>
          </div>
        </template>

        <template v-else>
          <div class="cta">
            <a v-if="featured.url" class="btn secondary" :href="featured.url" target="_blank">Visita il sito</a>
            <RouterLink v-if="featured.slug" class="btn ghost" :to="`/project/${featured.slug}`">Dettagli progetto</RouterLink>
          </div>
        </template>
      </div>

      <aside class="card" style="padding:0;overflow:hidden">
        <template v-if="isPublic(featured)">
          <a class="card-cover" :href="featured.url || '#'" target="_blank">
            <img :src="featured.cover || '/assets/img/cover-1.jpg'" :alt="`Anteprima: ${featured.title}`" />
          </a>
        </template>
        <template v-else>
          <div class="card-cover">
            <img :src="featured.cover || '/assets/img/abstract-kpi.jpg'" alt="Illustrazione astratta NDA" />
          </div>
        </template>
      </aside>
    </div>
  </section>
</template>

<script setup>
defineProps({ featured: Object, isNDA: Function, isPublic: Function })
</script>
