<template>
  <section v-if="featured" class="section alt reveal" aria-labelledby="featured-title">
    <!-- Aurora leggera -->
    <div class="feat-bg" aria-hidden="true"></div>

    <div class="container two-col">
      <!-- COPY -->
      <div class="feat-copy">
        <p class="eyebrow muted">In evidenza</p>

        <h2 id="featured-title" class="feat-title">
          {{ featured.title || 'Case study' }}
          <span v-if="isNDA(featured)" class="nda-badge" aria-label="Progetto coperto da NDA">NDA</span>
        </h2>

        <p class="lead">
          {{ summary }}
        </p>

        <!-- Stack (se disponibile) -->
        <ul v-if="stack && stack.length" class="badges tech" aria-label="Stack tecnico principale">
          <li v-for="(t, i) in stack" :key="i">{{ t }}</li>
        </ul>

        <!-- Highlight / KPI -->
        <ul v-if="impactList && impactList.length" class="kpi-list feat-kpi" aria-label="Impatto del progetto">
          <li v-for="(k,i) in impactList" :key="i"><span class="kpi-badge">{{ k }}</span></li>
        </ul>

        <!-- Challenge/Approach (solo NDA) -->
        <template v-if="isNDA(featured)">
          <div v-if="featured.challenge?.length" class="feat-block">
            <h3 class="feat-h3">Challenge</h3>
            <ul class="bullets">
              <li v-for="(c, i) in featured.challenge" :key="'c'+i">{{ c }}</li>
            </ul>
          </div>

          <div v-if="featured.approach?.length" class="feat-block">
            <h3 class="feat-h3">Approach</h3>
            <ul class="bullets">
              <li v-for="(a, i) in featured.approach" :key="'a'+i">{{ a }}</li>
            </ul>
          </div>

          <p class="muted nda-note">
            Per accordi di riservatezza, UI e dati non sono pubblicabili.
            Posso mostrare <em>demo con dati sintetici</em> su richiesta.
          </p>

          <div class="cta">
            <a class="btn secondary" :href="mailtoHref">Richiedi demo</a>
            <RouterLink v-if="featured.slug" class="btn ghost" :to="`/project/${featured.slug}`">Dettagli progetto</RouterLink>
          </div>
        </template>

        <!-- CTA per progetto pubblico -->
        <template v-else>
          <div class="cta">
            <a v-if="featured.url" class="btn secondary" :href="featured.url" target="_blank" rel="noopener">
              Visita il sito
            </a>
            <RouterLink v-if="featured.slug" class="btn ghost" :to="`/project/${featured.slug}`">
              Dettagli progetto
            </RouterLink>
          </div>
        </template>
      </div>

      <!-- MEDIA -->
      <aside class="card feat-media" :class="{'is-nda': isNDA(featured)}">
        <div class="media-wrap">
          <!-- Orbits + Shine -->
          <svg class="orbit orbit-a" viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <linearGradient id="feat-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="var(--primary)" />
                <stop offset="100%" stop-color="var(--accent)" />
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r="175" fill="none" stroke="url(#feat-grad)" stroke-width="1.6" />
          </svg>
          <svg class="orbit orbit-b" viewBox="0 0 400 400" aria-hidden="true">
            <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(0,245,255,.45)" stroke-width="1" stroke-dasharray="6 10" />
          </svg>
          <div class="shine" aria-hidden="true"></div>

          <template v-if="isPublic(featured)">
            <a class="card-cover hover-zoom" :href="featured.url || '#'" target="_blank" rel="noopener">
              <img :src="featured.cover || '/assets/img/cover-1.jpg'" :alt="`Anteprima: ${featured.title}`" loading="lazy" decoding="async" />
            </a>
          </template>
          <template v-else>
            <div class="card-cover hover-zoom">
              <img :src="featured.cover || '/assets/img/abstract-kpi.jpg'" alt="Illustrazione astratta NDA" loading="lazy" decoding="async" />
            </div>
          </template>

          <!-- Chips dinamiche (mostra prime 3 tech) -->
          <transition-group name="chip" tag="div" class="chips">
            <span v-for="(t, i) in chipTech" :key="t + i" class="chip glass">{{ t }}</span>
          </transition-group>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  featured: { type: Object, required: true },
  isNDA: { type: Function, required: true },
  isPublic: { type: Function, required: true }
})

/* Copy mirata — fallback intelligenti */
const summary = computed(() => {
  if (props.featured?.excerpt) return props.featured.excerpt
  if (props.isNDA(props.featured)) {
    return 'CRM e processi interni ottimizzati: performance, sicurezza e DX. Case study protetto da NDA.'
  }
  return 'Progetto pubblico con focus su performance, UX e componenti scalabili. Migliorate Core Web Vitals e SEO.'
})

/* Stack / Impact */
const stack = computed(() => props.featured?.stack || props.featured?.tech || [])
const impactList = computed(() => props.featured?.impact || [])

/* Chips: prime 3 tecnologie (se presenti) */
const chipTech = computed(() => (stack.value || []).slice(0, 3))

/* CTA Mail */
const mailtoHref = computed(() => {
  const subject = encodeURIComponent(`Richiesta demo case study — ${props.featured?.title || 'Progetto NDA'}`)
  const body = encodeURIComponent('Ciao, vorrei vedere una demo con dati sintetici del case study.\n\nContesto:\n- Azienda/Settore:\n- Obiettivo:\n- Timing:\n\nGrazie!')
  return `mailto:hello@example.com?subject=${subject}&body=${body}`
})
</script>

<style scoped>
/* Backdrop aurora */
.feat-bg{
  position:absolute; inset:0; pointer-events:none; z-index:0;
  background:
    radial-gradient(700px 320px at 20% 10%, rgba(124,58,237,.16), transparent),
    radial-gradient(700px 320px at 80% 90%, rgba(0,245,255,.12), transparent);
  animation: hueFeat 20s linear infinite;
}
@keyframes hueFeat { 50% { filter: hue-rotate(90deg) } }

/* Layout */
.feat-copy{ position:relative; z-index:1; }
.feat-title{ display:flex; align-items:center; gap:10px; margin:0; }
.nda-badge{
  display:inline-flex; align-items:center; gap:6px; font-size:12px;
  padding:6px 10px; border-radius:999px; border:1px solid var(--stroke);
  color:var(--text);
  background: linear-gradient(180deg, color-mix(in oklab, var(--card), transparent 6%), transparent);
}

/* KPI spacing */
.feat-kpi{ margin: 12px 0; }

/* Blocco con titoletti */
.feat-block{ margin-top: 14px; }
.feat-h3{ margin:0 0 6px; font-size: 16px; letter-spacing:.2px }

/* MEDIA + effetti */
.feat-media{ padding:0; overflow:hidden; position:relative; }
.media-wrap{
  position: relative; isolation:isolate; border-radius: var(--radius);
}
.card-cover img{
  width:100%; height:100%; object-fit:cover; display:block;
  transform: scale(1); transition: transform var(--t-slow) ease;
}
.hover-zoom:hover img{ transform: scale(1.03); }

/* Orbits + Shine */
.orbit{ position:absolute; inset:0; pointer-events:none; z-index:1; }
.orbit-a{ animation: orbitSpin 16s linear infinite; opacity:.9 }
.orbit-b{ animation: orbitSpinRev 22s linear infinite; opacity:.65 }
@keyframes orbitSpin { to{ transform: rotate(360deg) } }
@keyframes orbitSpinRev { to{ transform: rotate(-360deg) } }

.shine{
  position:absolute; inset:-20%; z-index:2; pointer-events:none;
  background: radial-gradient(closest-side, rgba(0,245,255,.10), transparent 60%);
  filter: blur(18px); opacity:.0; transform: scale(.8);
  transition: opacity var(--t-med) ease, transform var(--t-slow) ease;
}
.media-wrap:hover .shine{ opacity:.8; transform: scale(1) }

/* Chips fluttuanti */
.chips{
  position:absolute; inset:0; z-index:3; pointer-events:none;
}
.chip{
  position:absolute; top:10%; left:8%;
  font-size:12px; padding:6px 10px; border-radius:999px;
  border:1px solid var(--stroke); color:var(--text);
  background:linear-gradient(180deg, color-mix(in oklab, var(--card), transparent 6%), transparent);
  box-shadow:0 10px 24px rgba(0,0,0,.22);
  animation: floatY 6s ease-in-out infinite;
}
.chip-enter-from, .chip-leave-to { opacity:0; transform: translateY(6px) }
.chip-enter-active, .chip-leave-active { transition: .35s ease }
.chip:nth-child(1){ top:10%; left:6%; }
.chip:nth-child(2){ top:16%; right:8%; left:auto; animation-duration:7s }
.chip:nth-child(3){ bottom:10%; left:12%; top:auto; animation-duration:6.5s }
@keyframes floatY { 0%,100%{ transform: translateY(0)} 50%{ transform: translateY(-6px)} }

/* Tech badges */
.badges.tech{ margin-top: 10px; }

/* NDA stato */
.is-nda .orbit-a, .is-nda .orbit-b{ opacity:.35 }
.is-nda .shine{ opacity:.35 }

/* Riduzione motion */
@media (prefers-reduced-motion: reduce){
  .orbit-a, .orbit-b, .shine, .chip{ animation: none !important; transition: none !important }
}
</style>
