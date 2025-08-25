<template>
  <section id="portfolio" class="section reveal" aria-labelledby="portfolio-title">
    <div class="pf-bg" aria-hidden="true"></div>

    <div class="container">
      <header class="section-head pf-head">
        <p class="eyebrow muted">Progetti</p>
        <h2 id="portfolio-title">Portfolio</h2>
        <p>Selezione di lavori recenti: <strong>pubblici</strong> e <strong>case study NDA-safe</strong>. Filtra per competenza.</p>

        <div class="tags" role="tablist" aria-label="Filtri portfolio">
          <a class="tag" :class="{ active: activeTag === '' }" href="#portfolio" @click.prevent="setTag('')">Tutti</a>
          <a
            v-for="t in allTags"
            :key="t"
            class="tag"
            :class="{ active: activeTag === t }"
            :href="`?tag=${encodeURIComponent(t)}#portfolio`"
            @click.prevent="setTag(t)"
          >#{{ t }}</a>
        </div>
      </header>

      <!-- Grid con transizioni (enter/move) -->
      <transition-group
        tag="div"
        class="grid pf-grid"
        name="pf"
        appear
        @leave="explodeLeave"
      >
        <article
          v-for="p in filtered"
          :key="p.slug || p.title"
          class="card pf-card"
          style="grid-column: span 6"
          :data-tilt="true"
          @mouseenter="cacheRect"
          @mousemove="handleTilt"
          @mouseleave="resetTilt"
        >
          <!-- Neon decor -->
          <span class="pf-shine" aria-hidden="true"></span>
          <svg class="pf-orbit pf-orbit-a" viewBox="0 0 400 400" aria-hidden="true">
            <defs>
              <linearGradient id="pf-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="var(--primary)"/>
                <stop offset="100%" stop-color="var(--accent)"/>
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r="175" fill="none" stroke="url(#pf-grad)" stroke-width="1.4"/>
          </svg>
          <svg class="pf-orbit pf-orbit-b" viewBox="0 0 400 400" aria-hidden="true">
            <circle cx="200" cy="200" r="145" fill="none" stroke="rgba(0,245,255,.45)" stroke-width="1" stroke-dasharray="6 10"/>
          </svg>

          <!-- Cover -->
          <template v-if="isPublic(p)">
            <a class="card-cover pf-cover hover-zoom" :href="p.url" target="_blank" rel="noopener">
              <img :src="coverSrc(p)" :alt="`Anteprima: ${p.title}`" loading="lazy" decoding="async" />
            </a>
          </template>
          <template v-else>
            <div class="card-cover pf-cover hover-zoom">
              <img :src="coverSrc(p)" alt="Illustrazione astratta del case study" loading="lazy" decoding="async" />
            </div>
          </template>

          <!-- Body -->
          <div class="card-body">
            <h3 class="card-title">
              <a v-if="p.url && isPublic(p)" :href="p.url" target="_blank" rel="noopener">{{ p.title }}</a>
              <RouterLink v-else-if="p.slug" :to="`/project/${p.slug}`">{{ p.title }}</RouterLink>
              <template v-else>{{ p.title }}</template>
            </h3>

            <p v-if="p.industry || p.year || p.role" class="muted meta">
              <template v-if="p.industry">{{ p.industry }}</template>
              <template v-if="p.year"> • {{ p.year }}</template>
              <template v-if="p.role"> • {{ p.role }}</template>
            </p>

            <p v-if="p.excerpt" class="card-desc">{{ p.excerpt }}</p>

            <template v-if="isNDA(p)">
              <ul v-if="p.impact?.length" class="kpi-list">
                <li v-for="(i, k) in p.impact" :key="k"><span class="kpi-badge">{{ i }}</span></li>
              </ul>
              <ul v-if="p.approach?.length" class="bullets">
                <li v-for="(a, i) in p.approach" :key="i">{{ a }}</li>
              </ul>
              <p class="muted nda-note">
                NDA: UI e dati non pubblicabili.
                <a :href="mailtoHref(p)">Richiedi demo</a>.
              </p>
            </template>

            <div v-if="!isNDA(p) && p.url" class="cta pf-cta">
              <a class="btn ghost" :href="p.url" target="_blank" rel="noopener">Visita il sito</a>
              <RouterLink v-if="p.slug" class="btn ghost" :to="`/project/${p.slug}`">Dettagli</RouterLink>
            </div>

            <ul v-if="p.tags?.length" class="card-tags" aria-label="Tag progetto">
              <li v-for="(t, i) in p.tags" :key="i">#{{ t }}</li>
            </ul>
          </div>
        </article>
      </transition-group>

      <p v-if="filtered.length === 0" class="muted" style="margin-top:16px">Nessun progetto disponibile per questo filtro.</p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
// ---- FX CONFIG (fluido + duraturo) ----
const FX = {
  rows: 7,          // prima 6 ——> più frammenti (impatto)
  cols: 10,         // prima 8 ——> più frammenti (impatto)
  duration: 1100,    // prima 720 ——> più lungo
  delayScale: 28,   // prima 25 ——> spread dei ritardi più morbido
  spreadBase: 120,  // prima 90 ——> esplosione più ampia
  zMin: -160, zMax: 220, // profondità 3D più pronunciata
  blur: 8,         // prima 8 ——> polvere più “soffice”
  easing: 'cubic-bezier(.16,.84,.24,1)' // più setosa
}

// Adattivo: su device “deboli” riduci la complessità
try {
  const mem = navigator.deviceMemory || 4
  const cores = navigator.hardwareConcurrency || 4
  if (mem < 4 || cores < 4) {
    FX.rows = 6
    FX.cols = 9
    FX.duration = 780
    FX.spreadBase = 90
  }
} catch {}

/* ===== DATA ===== */
const activeTag = ref('')

const projects = ref([
  {
    title: "Portfolio Personale",
    slug: "portfolio-personale",
    type: "public",
    featured: true,
    year: 2025,
    excerpt: "Il mio sito personale: design moderno, spotlight interattivo e filtri portfolio.",
    url: "https://example.com",
    cover: "cover-1.jpg",
    tags: ["php", "frontend", "personal"],
  },
  {
    title: "Sito GoBike",
    slug: "landing-gobike",
    type: "public",
    year: 2024,
    excerpt: "Landing page con countdown live, form contatti e ottimizzazione SEO.",
    url: "https://gotobike.netlify.app",
    cover: "gobike.png",
    tags: ["frontend", "vue", "css", "scss"],
  },
  {
    title: "Landing Page Evento Tech",
    slug: "landing-evento-tech",
    type: "public",
    year: 2024,
    excerpt: "Landing page con countdown live, form contatti e ottimizzazione SEO.",
    url: "https://example.com/evento",
    cover: "cover-1.jpg",
    tags: ["seo", "frontend", "html", "css"],
  },
  {
    title: "CRM Produzione — Scheduling & KPI",
    slug: "crm-produzione-kpi",
    type: "case_study",
    nda: true,
    year: 2025,
    industry: "Manifatturiero",
    role: "Lead Developer",
    excerpt: "Case study: pianificazione risorse multi-stabilimento e KPI real-time.",
    challenge: ["Allineare la pianificazione tra più stabilimenti","Ridurre i tempi di ciclo non monitorati"],
    approach: ["Ottimizzazione query MySQL + caching","Eventi asincroni per aggiornamenti KPI","Ruoli e permessi granulari"],
    impact: ["Tempo ciclo ordine −27%","Report KPI < 500ms p95","Errori inserimento dati −40%"],
    cover: "abstract-kpi.jpg",
    tags: ["php","mysql","performance","crm"],
  },
  {
    title: "CRM Clienti — Pipeline commerciale",
    slug: "crm-pipeline-commerciale",
    type: "case_study",
    nda: true,
    year: 2024,
    industry: "Servizi B2B",
    role: "Full-stack Developer",
    excerpt: "Case study: pipeline, reminder e automazioni email.",
    challenge: ["Mancanza di visibilità sullo stato dei lead","Processi manuali per follow-up"],
    approach: ["Pipeline drag&drop in JS","Reminder automatici via cron job","Integrazione email transazionali"],
    impact: ["+22% lead convertiti","Follow-up automatizzati (−80% errori)","Visibilità completa ciclo vendite"],
    cover: "abstract-crm.jpg",
    tags: ["crm","automation","php","js"],
  },
])

/* ===== COMPUTED ===== */
const allTags = computed(() => {
  const set = new Set()
  projects.value.forEach(p => (p.tags || []).forEach(t => set.add(t)))
  return Array.from(set).sort((a,b) => a.localeCompare(b))
})

const sorted = computed(() => {
  return [...projects.value].sort((a, b) => {
    if ((b.featured ? 1 : 0) !== (a.featured ? 1 : 0)) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    return (b.year || 0) - (a.year || 0)
  })
})

const filtered = computed(() => {
  const list = sorted.value
  if (!activeTag.value) return list
  return list.filter(p => p.tags?.includes(activeTag.value))
})

/* ===== LIFECYCLE ===== */
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const tag = params.get('tag')
  if (tag && allTags.value.includes(tag)) activeTag.value = tag
})

/* ===== HELPERS ===== */
function isPublic(p){ return p.type === 'public' && !p.nda }
function isNDA(p){ return p.nda === true || p.type === 'case_study' }

function setTag(tag){
  activeTag.value = tag
  const url = new URL(window.location.href)
  if (tag) url.searchParams.set('tag', tag)
  else url.searchParams.delete('tag')
  url.hash = '#portfolio'
  window.history.replaceState({}, '', url.toString())
}

function coverSrc(p){
  const c = p.cover || ''
  if (/^https?:\/\//i.test(c)) return c
  if (c.startsWith('/')) return c
  try{ return new URL(`../assets/img/${c}`, import.meta.url).href }catch{ return '/assets/img/cover-1.jpg' }
}

/* ===== Tilt 3D (cache rect su mouseenter) ===== */
let tiltRaf = 0, cx = 0, cy = 0, w = 0, h = 0
function cacheRect(e){
  const rect = e.currentTarget.getBoundingClientRect()
  w = rect.width; h = rect.height
  cx = rect.left + w/2
  cy = rect.top + h/2
}
function handleTilt(e){
  if (!w || !h) cacheRect(e)
  const card = e.currentTarget
  const dx = (e.clientX - cx) / w
  const dy = (e.clientY - cy) / h
  if (tiltRaf) return
  tiltRaf = requestAnimationFrame(() => {
    card.style.setProperty('--rx', (dy * 8).toFixed(2) + 'deg')
    card.style.setProperty('--ry', (dx * -10).toFixed(2) + 'deg')
    tiltRaf = 0
  })
}
function resetTilt(e){
  const card = e.currentTarget
  card.style.setProperty('--rx', '0deg')
  card.style.setProperty('--ry', '0deg')
}

/* ===== EXPLOSION / SHATTER (triangular mesh + shockwave) ===== */
function explodeLeave(el, done){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    el.parentNode && el.parentNode.removeChild(el); done(); return
  }

  const rect = el.getBoundingClientRect()
  const radius = getComputedStyle(el).borderRadius || '16px'
  const coverImg = el.querySelector('.pf-cover img')
  const bgUrl = coverImg ? (coverImg.currentSrc || coverImg.src) : ''
  const hasCover = !!bgUrl

  // Rimuovi subito la card dalla grid: il layout filtrato appare sotto
  el.parentNode && el.parentNode.removeChild(el)

  // Overlay
  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position:'fixed', left: rect.left+'px', top: rect.top+'px',
    width: rect.width+'px', height: rect.height+'px',
    pointerEvents:'none', zIndex: 9999, perspective:'1200px',
    contain:'layout paint', transformStyle:'preserve-3d', willChange:'transform'
  })

  // Flash + shockwave (uguali alla tua versione, leggermente più soft)
  const flash = document.createElement('div')
  Object.assign(flash.style, { position:'absolute', inset:0, borderRadius:radius, background:'radial-gradient(circle at 50% 50%, rgba(255,255,255,.8), rgba(255,255,255,0) 60%)', opacity:0 })
  overlay.appendChild(flash)
  flash.animate([{opacity:0},{opacity:.85,offset:.12},{opacity:0}], {duration:380, easing:'ease-out', fill:'forwards'})

  const ring = document.createElement('div')
  Object.assign(ring.style, { position:'absolute', inset:'-2px', borderRadius:radius, boxShadow:'0 0 0 0 rgba(0,245,255,.6), inset 0 0 0 0 rgba(124,58,237,.35)', filter:'blur(0px)', opacity:.9 })
  overlay.appendChild(ring)
  ring.animate([
    { transform:'scale(.88)', boxShadow:'0 0 0 0 rgba(0,245,255,.6), inset 0 0 0 0 rgba(124,58,237,.35)', filter:'blur(2px)', opacity:.9 },
    { transform:'scale(1.18)', boxShadow:'0 0 0 16px rgba(0,245,255,0), inset 0 0 0 12px rgba(124,58,237,0)', filter:'blur(10px)', opacity:0 }
  ], { duration:560, easing:'cubic-bezier(.2,.8,.2,1)', fill:'forwards' })

  // Mesh triangolare “jittered”
  const rows = FX.rows, cols = FX.cols
  const pts = []
  for (let r=0; r<=rows; r++){
    for (let c=0; c<=cols; c++){
      const jx = (Math.random()-0.5) * (1/cols) * .55
      const jy = (Math.random()-0.5) * (1/rows) * .55
      pts.push({ x: clamp01((c/cols)+jx), y: clamp01((r/rows)+jy) })
    }
  }
  const idx = (r,c)=> r*(cols+1)+c

  const frags = document.createDocumentFragment()
  let doneCount = 0
  const total = rows*cols*2

  for (let r=0; r<rows; r++){
    for (let c=0; c<cols; c++){
      const p00 = pts[idx(r,c)], p10 = pts[idx(r,c+1)]
      const p01 = pts[idx(r+1,c)], p11 = pts[idx(r+1,c+1)]
      const tris = Math.random() < .5
        ? [[p00,p10,p11],[p00,p11,p01]]
        : [[p00,p10,p01],[p10,p11,p01]]

      for (const tri of tris){
        const shard = document.createElement('div')
        Object.assign(shard.style, {
          position:'absolute', left:0, top:0, width:'100%', height:'100%',
          clipPath:`polygon(${(tri[0].x*100).toFixed(2)}% ${(tri[0].y*100).toFixed(2)}%, ${(tri[1].x*100).toFixed(2)}% ${(tri[1].y*100).toFixed(2)}%, ${(tri[2].x*100).toFixed(2)}% ${(tri[2].y*100).toFixed(2)}%)`,
          borderRadius: radius, willChange:'transform,opacity,filter', backfaceVisibility:'hidden'
        })

        if (hasCover){
          const imgLayer = document.createElement('div')
          Object.assign(imgLayer.style, {
            position:'absolute', inset:0,
            backgroundImage:`url("${bgUrl}")`,
            backgroundSize:`${rect.width}px ${rect.height}px`,
            backgroundPosition:`0 0`, backgroundRepeat:'no-repeat'
          })
          shard.appendChild(imgLayer)
        }
        const glow = document.createElement('div')
        Object.assign(glow.style, { position:'absolute', inset:0, borderRadius:radius, background:'radial-gradient(closest-side, rgba(0,245,255,.12), rgba(124,58,237,.08) 60%, transparent 100%)', mixBlendMode:'screen' })
        shard.appendChild(glow)

        frags.appendChild(shard)

        // vettori + 2 fasi: “blast” → “drift”
        const cx = (tri[0].x + tri[1].x + tri[2].x)/3 - .5
        const cy = (tri[0].y + tri[1].y + tri[2].y)/3 - .5
        const dist = Math.hypot(cx, cy) + 0.2
        const dirX = cx / .5
        const dirY = cy / .5

        const dx = dirX * (FX.spreadBase * dist + rand(12,42))
        const dy = dirY * (FX.spreadBase * dist + rand(12,42))
        const dz = rand(FX.zMin, FX.zMax)
        const rotX = rand(-40, 40), rotY = rand(-40, 40), rotZ = rand(-60, 60)
        const delay = dist * FX.delayScale + rand(0, 40)

        // Fase 1: BLAST (esplosione)
        const blast = shard.animate([
          { transform:'translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0)', opacity:1, filter:'blur(0px)' },
          { transform:`translate3d(${dx}px, ${dy}px, ${dz}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`, opacity:.55, filter:`blur(${FX.blur}px)` }
        ], {
          duration: FX.duration * 0.72,
          delay,
          easing: FX.easing,
          fill:'forwards'
        })

        // Fase 2: DRIFT (scivola e dissolve → più “duraturo”)
        blast.addEventListener('finish', () => {
          shard.animate([
            { transform:`translate3d(${dx}px, ${dy}px, ${dz}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`, opacity:.55, filter:`blur(${FX.blur}px)` },
            { transform:`translate3d(${dx*1.18}px, ${dy*1.18}px, ${dz*1.05}px) rotateX(${rotX+rand(-8,8)}deg) rotateY(${rotY+rand(-8,8)}deg) rotateZ(${rotZ+rand(-10,10)}deg)`, opacity:0, filter:`blur(${FX.blur+2}px)` }
          ], {
            duration: FX.duration * 0.45,
            easing: 'cubic-bezier(.2,.8,.2,1)',
            fill:'forwards'
          }).addEventListener('finish', () => {
            if (++doneCount === total){ overlay.remove(); done() }
          })
        })
      }
    }
  }

  overlay.appendChild(frags)
  document.body.appendChild(overlay)
}


function rand(min,max){ return Math.random()*(max-min)+min }
function clamp01(v){ return Math.max(0, Math.min(1, v)) }

/* Mailto per NDA */
function mailtoHref(p){
  const subject = encodeURIComponent(`Richiesta demo case study — ${p.title}`)
  const body = encodeURIComponent('Ciao, vorrei vedere una demo con dati sintetici del case study.\n\nContesto:\n- Azienda/Settore:\n- Obiettivo:\n- Timing:\n\nGrazie!')
  return `mailto:hello@example.com?subject=${subject}&body=${body}`
}
</script>

<style scoped>
/* Aurora / background */
.pf-bg{
  position:absolute; inset:0; pointer-events:none; z-index:0;
  background:
    radial-gradient(760px 340px at 15% 10%, rgba(124,58,237,.14), transparent),
    radial-gradient(760px 340px at 85% 90%, rgba(0,245,255,.12), transparent);
  animation: pfHue 22s linear infinite;
}
@keyframes pfHue { 50% { filter: hue-rotate(90deg) } }

.pf-head{ position:relative; z-index:1; }

/* Filtri neon (coerenti con palette) */
.tags{ display:flex; flex-wrap:wrap; gap:10px; margin-top:10px }
.tag{
  border:1px solid var(--stroke); padding:7px 12px; border-radius:999px; font-size:14px; color:var(--muted);
  transition:box-shadow var(--t-med) ease, background var(--t-med) ease, transform var(--t-fast) ease;
  background: linear-gradient(180deg, color-mix(in oklab, var(--card), transparent 6%), transparent);
  will-change: transform;
}
.tag:hover{ transform:translateY(-1px) }
.tag.active,.tag:hover{
  border-color:transparent;background:rgba(0,245,255,.18);color:#fff;
  box-shadow:0 0 0 2px rgba(0,245,255,.15), 0 10px 24px rgba(0,245,255,.28)
}

/* Transition-group (enter/move). Leave è istantanea: overlay gestisce l’effetto */
.pf-enter-from{ opacity:0; transform: translateY(16px) scale(.98); filter: blur(2px) }
.pf-enter-active{ transition: .42s cubic-bezier(.2,.8,.2,1) }
.pf-move{ transition: transform .42s cubic-bezier(.2,.8,.2,1) }
.pf-leave-active{ transition: .001s linear }

/* Card futuristiche */
.pf-card{
  position:relative; overflow:hidden; border-radius: var(--radius);
  transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform var(--t-slow) ease, box-shadow var(--t-med) ease, border-color var(--t-med) ease;
  will-change: transform;
}
.pf-card::before{
  content:""; position:absolute; inset:0; padding:1px; border-radius:inherit;
  background: conic-gradient(from 0deg, transparent 0 30%, rgba(0,245,255,.28), transparent 60% 100%);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor; mask-composite:exclude;
  opacity:0; transition: opacity var(--t-slow) ease;
}
.pf-card:hover::before{ opacity:1; }

/* Shine & orbite */
.pf-shine{
  position:absolute; inset:-35%; pointer-events:none; z-index:1;
  background: radial-gradient(closest-side, rgba(0,245,255,.10), transparent 60%);
  filter: blur(22px); opacity:0; transform:scale(.8);
  transition: opacity var(--t-med) ease, transform var(--t-slow) ease;
}
.pf-card:hover .pf-shine{ opacity:.85; transform:scale(1); }

.pf-orbit{ position:absolute; inset:0; pointer-events:none; z-index:1; }
.pf-orbit-a{ animation: pfSpin 18s linear infinite; opacity:.85 }
.pf-orbit-b{ animation: pfSpinRev 24s linear infinite; opacity:.6 }
@keyframes pfSpin { to{ transform: rotate(360deg) } }
@keyframes pfSpinRev { to{ transform: rotate(-360deg) } }

.pf-cover{ position: relative; z-index: 2; }
.pf-cover img{ width:100%; height:100%; object-fit:cover; display:block; }

/* Meta & CTA */
.meta{ margin: 6px 0 6px; }
.pf-cta{ margin-top: 10px; }

/* Responsive colonne */
@media (min-width: 576px){ .pf-card[style]{ grid-column: span 6 !important; } }
@media (min-width: 992px){ .pf-card[style]{ grid-column: span 4 !important; } }
@media (min-width: 1200px){ .pf-card[style]{ grid-column: span 3 !important; } }

/* Reduce motion */
@media (prefers-reduced-motion: reduce){
  .pf-orbit-a, .pf-orbit-b, .pf-shine { animation: none !important; transition: none !important; }
  .pf-card { transform: none !important; }
}
/* Migliora la qualità del 3D e la composizione GPU */
.pf-card { transform-style: preserve-3d; will-change: transform; }

</style>
