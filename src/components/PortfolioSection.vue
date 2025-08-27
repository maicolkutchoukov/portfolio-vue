<script>
import { projects } from "@/data/projects";

export default {
  name: "PortfolioSection",

  data() {
    return {
      activeTag: "",
      projects,
      isLoading: true,          // skeleton attivo finché non decodifichiamo le immagini
      skeletonCount: 3,
      _cleanup: null,
      _io: null,                // IntersectionObserver per reveal progressivo
    };
  },

  computed: {
    allTags() {
      const set = new Set();
      this.projects.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    },
    filtered() {
      if (!this.activeTag) return this.projects;
      return this.projects.filter((p) => p.tags?.includes(this.activeTag));
    },
  },

  mounted() {
    // Aggancia ?tag=...
    const params = new URLSearchParams(window.location.search);
    const tag = params.get("tag");
    if (tag && this.allTags.includes(tag)) this.activeTag = tag;

    // Calcola un skeleton realistico per il primo paint
    this.skeletonCount = this._computeSkeletonCount(this.filtered.length);

    // Punto ripple sul wrapper (usato per glow/onde)
    const grid = this.$refs.gridEl ?? document.querySelector("#portfolio .pf-grid");
    if (!(grid instanceof HTMLElement)) return;

    const setPos = (x, y) => {
      const r = grid.getBoundingClientRect();
      grid.style.setProperty("--mx", (((x - r.left) / r.width) * 100).toFixed(2) + "%");
      grid.style.setProperty("--my", (((y - r.top) / r.height) * 100).toFixed(2) + "%");
    };
    const onMove = (e) => setPos(e.clientX, e.clientY);
    const onDown = (e) => setPos(e.clientX, e.clientY);

    grid.addEventListener("pointermove", onMove, { passive: true });
    grid.addEventListener("pointerdown", onDown, { passive: true });

    // Osserva le card che entrano in viewport per animazione progressiva
    this._io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (!el.dataset.revealed && !this.isLoading) {
            this._scaleSpringIn(el, Number(el.style.getPropertyValue("--i")) * 90);
            el.dataset.revealed = "1";
          }
        }
      }
    }, { root: null, threshold: 0.14, rootMargin: "-8% 0px" });

    // Quando il DOM è pronto, gestiamo lo skeleton
    this.$nextTick(() => this._settleLoading());

    this._cleanup = () => {
      grid.removeEventListener("pointermove", onMove);
      grid.removeEventListener("pointerdown", onDown);
      this._io?.disconnect();
    };
  },

  beforeUnmount() {
    this._cleanup?.();
  },

  methods: {
    isPublic(p){ return p.type === "public" && !p.nda; },
    isNDA(p){ return p.nda === true || p.type === "case_study"; },
    coverSrc(p){
      const c = p.cover || "";
      if (/^https?:\/\//i.test(c)) return c;
      if (c.startsWith("/")) return c;
      try { return new URL(`../assets/img/${c}`, import.meta.url).href; }
      catch { return "/assets/img/cover-1.jpg"; }
    },

    async filterWithShatter(tag) {
      const grid = this.$refs.gridEl ?? document.querySelector("#portfolio .pf-grid");
      if (grid instanceof HTMLElement) { grid.classList.remove("pf-shock"); void grid.offsetWidth; grid.classList.add("pf-shock"); }

      // Pre-calcola quante card avremo dopo il filtro per regolare lo skeleton
      const nextLen = tag ? this.projects.filter(p => (p.tags||[]).includes(tag)).length : this.projects.length;
      this.skeletonCount = this._computeSkeletonCount(nextLen);
      this.isLoading = true; // attiva skeleton compact/adattivo

      // Uscita leggera delle card correnti
      const cards = Array.from(this.$el.querySelectorAll(".pf-card"));
      await Promise.allSettled(cards.map((el, i) => this._fadeOut(el, i * 10)));

      // Aggiorna filtro + URL
      this.activeTag = tag;
      const url = new URL(window.location.href);
      if (tag) url.searchParams.set("tag", tag); else url.searchParams.delete("tag");
      url.hash = "#portfolio";
      window.history.replaceState({}, "", url.toString());

      await this.$nextTick();

      // Attendi immagini pronte, poi cascata con overlap
      await this._settleLoading();

      const nextCards = Array.from(this.$el.querySelectorAll(".pf-card"));
      nextCards.forEach((c) => {
        c.removeAttribute("data-assembling");
        c.dataset.revealed = ""; // reset
      });
      this._cascadeSpringReveal(nextCards);
    },

    // --- Micro utilities animazioni ---
    _fadeOut(el, delay = 0) {
      return el.animate([
        { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0px)" },
        { opacity: 0, transform: "translateY(8px) scale(.98)", filter: "blur(2px)" }
      ], { duration: 180, delay, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }).finished.catch(()=>{});
    },

    // Animazione singola card: piccola -> leggero overshoot -> 1x (futuristica, fluida)
    _scaleSpringIn(el, delay = 0) {
      // stato iniziale
      el.style.opacity = 0;
      el.style.transform = "translateY(8px) scale(.86)";
      return el.animate([
        { opacity: 0, transform: "translateY(8px) scale(.86)", filter:"blur(2px)" },
        { opacity: 1, transform: "translateY(0) scale(1.04)", filter:"blur(.2px)" },
        { opacity: 1, transform: "translateY(0) scale(1)", filter:"blur(0)" },
      ], {
        duration: 520,
        delay,
        easing: "cubic-bezier(.2,.9,.2,1)",
        fill: "forwards"
      }).finished.catch(()=>{});
    },

    // Cascata con overlap: mentre la prima cresce, parte la seconda, ecc.
    _cascadeSpringReveal(nodes) {
      const step = 140; // distanza tra start animazioni
      nodes.forEach((el, i) => {
        this._scaleSpringIn(el, i * step);
      });
    },

    // Attende il decode di tutte le immagini visibili, poi disattiva skeleton
    async _settleLoading(minDelay = 160) {
      const start = performance.now();
      const imgs = Array.from(this.$el.querySelectorAll('.pf-card .pf-cover img'));
      const decodes = imgs.map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        if (img.decode) return img.decode().catch(()=>{});
        return new Promise(res => { img.addEventListener('load', res, { once:true }); img.addEventListener('error', res, { once:true }); });
      });
      await Promise.allSettled(decodes);
      const remain = Math.max(0, minDelay - (performance.now() - start));
      if (remain) await new Promise(r => setTimeout(r, remain));
      this.isLoading = false;

      // Avvia cascata iniziale con overlap + registra le future card nell'observer
      const cards = Array.from(this.$el.querySelectorAll(".pf-card"));
      this._cascadeSpringReveal(cards);
      cards.forEach(c => this._io?.observe(c));
    },

    // --- Skeleton adaptivo in base a viewport/numero risultati ---
    _computeSkeletonCount(resultLen) {
      const cols = this._getCols();
      // Mostra al massimo il numero di risultati, minimo 1, e non più di 2 righe di skeleton
      const maxVisible = cols * 2;
      return Math.max(1, Math.min(resultLen || 1, maxVisible));
    },
    _getCols() {
      if (window.matchMedia('(min-width: 992px)').matches) return 3; // desktop
      if (window.matchMedia('(min-width: 576px)').matches) return 2; // tablet
      return 1; // mobile
    },
  },
};
</script>

<template>
  <section id="portfolio" class="section" aria-labelledby="portfolio-title">
    <div class="container">
      <header class="section-head pf-head">
        <h2 id="portfolio-title">Portfolio</h2>
        <p>Selezione di lavori recenti: <strong>pubblici</strong> e <strong>case study NDA-safe</strong>. Filtra per competenza.</p>

        <div class="tags" role="tablist" aria-label="Filtri portfolio">
          <a class="tag" :class="{ active: activeTag === '' }" href="#portfolio" @click.prevent="filterWithShatter('')">Tutti</a>
          <a v-for="t in allTags" :key="t" class="tag" :class="{ active: activeTag === t }"
             :href="`?tag=${encodeURIComponent(t)}#portfolio`" @click.prevent="filterWithShatter(t)">#{{ t }}</a>
        </div>
      </header>

      <div class="grid pf-grid" ref="gridEl" :aria-busy="isLoading ? 'true' : 'false'">
        <div class="pf-grid-inner">
          <!-- SKELETON STATE -->
          <template v-if="isLoading">
            <article v-for="n in skeletonCount" :key="`sk-${n}`" class="pf-card sk-card">
              <div class="pf-cover sk-cover shimmer" aria-hidden="true"></div>
              <div class="pf-body">
                <div class="sk-line sk-title shimmer"></div>
                <div class="sk-line sk-meta shimmer"></div>
                <div class="sk-line sk-text shimmer"></div>
                <div class="sk-line sk-text short shimmer"></div>
                <ul class="pf-tags sk-tags">
                  <li class="sk-chip shimmer"></li>
                  <li class="sk-chip shimmer"></li>
                </ul>
              </div>
            </article>
          </template>

          <!-- REAL CONTENT -->
          <template v-else>
            <article
              v-for="(p, i) in filtered"
              :key="p.slug || p.title"
              class="pf-card"
              :style="{'--i': i}"
            >
              <span class="pf-holo" aria-hidden="true"></span>
              <span class="pf-dust" aria-hidden="true"></span>

              <template v-if="isPublic(p)">
                <a class="pf-cover" :href="p.url" target="_blank" rel="noopener">
                  <img :src="coverSrc(p)" :alt="`Anteprima: ${p.title}`" loading="lazy" decoding="async" />
                  <span class="pf-scan" aria-hidden="true"></span>
                </a>
              </template>
              <template v-else>
                <div class="pf-cover">
                  <img :src="coverSrc(p)" alt="Illustrazione astratta del case study" loading="lazy" decoding="async" />
                  <span class="pf-scan" aria-hidden="true"></span>
                </div>
              </template>

              <div class="pf-body">
                <h3 class="pf-title">
                  <a v-if="p.url && isPublic(p)" :href="p.url" target="_blank" rel="noopener">{{ p.title }}</a>
                  <RouterLink v-else-if="p.slug" :to="`/project/${p.slug}`">{{ p.title }}</RouterLink>
                  <template v-else>{{ p.title }}</template>
                </h3>

                <p v-if="p.industry || p.year || p.role" class="pf-meta muted">
                  <template v-if="p.industry">{{ p.industry }}</template>
                  <template v-if="p.year"> • {{ p.year }}</template>
                  <template v-if="p.role"> • {{ p.role }}</template>
                </p>

                <p v-if="p.excerpt" class="pf-desc">{{ p.excerpt }}</p>

                <template v-if="isNDA(p)">
                  <ul v-if="p.impact?.length" class="pf-kpi">
                    <li v-for="(it, k) in p.impact" :key="k"><span class="kpi">{{ it }}</span></li>
                  </ul>
                  <ul v-if="p.approach?.length" class="pf-bullets">
                    <li v-for="(a, j) in p.approach" :key="j">{{ a }}</li>
                  </ul>
                  <p class="muted" style="margin-top:8px">NDA: UI e dati non pubblicabili. <a href="mailto:hello@example.com?subject=Richiesta%20demo%20case%20study">Richiedi demo</a>.</p>
                </template>

                <div v-if="!isNDA(p) && p.url" class="pf-cta">
                  <a class="btn ghost" :href="p.url" target="_blank" rel="noopener">Visita il sito</a>
                  <RouterLink v-if="p.slug" class="btn ghost" :to="`/project/${p.slug}`">Dettagli</RouterLink>
                </div>

                <ul v-if="p.tags?.length" class="pf-tags" aria-label="Tag progetto">
                  <li v-for="(t, k) in p.tags" :key="k">#{{ t }}</li>
                </ul>
              </div>
            </article>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* =========================================================
   FUTURE-GLASS PORTFOLIO — cascata futuristica con overshoot
   ========================================================= */
.pf-head { position: relative; z-index: 1; }

/* Filtri */
.tags{ display:flex; flex-wrap:wrap; gap:10px; margin-top:12px }
.tag{
  display:inline-block; padding:8px 14px; border-radius:999px; font-weight:800;
  color:var(--text); border:1px solid var(--stroke);
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--card), transparent 6%), transparent),
    radial-gradient(90% 120% at 0% 0%, rgba(0,245,255,.10), transparent 60%),
    radial-gradient(90% 120% at 100% 100%, rgba(124,58,237,.12), transparent 60%);
  transition: transform .22s ease, box-shadow .22s ease, background .22s ease, border-color .22s ease;
}
.tag:hover { transform: translateY(-1px); box-shadow:0 10px 28px rgba(0,245,255,.18) }
.tag.active { box-shadow:0 0 0 2px rgba(0,245,255,.22), 0 10px 24px rgba(124,58,237,.18); border-color: transparent }

/* Grid 12-col; max 3 card per riga su desktop */
.pf-grid{ --mx:50%; --my:50%; position: relative; }
.grid{ display:grid; grid-template-columns:repeat(12,1fr); gap:18px }
.pf-grid-inner{ display:contents }

/* Glow molto cheap legato al mouse */
.pf-grid::before{
  content:""; position:absolute; inset:0; pointer-events:none; z-index:0;
  background: radial-gradient(600px 400px at var(--mx) var(--my), rgba(0,245,255,.06), transparent 60%),
              radial-gradient(500px 320px at calc(100% - var(--mx)) calc(100% - var(--my)), rgba(124,58,237,.05), transparent 70%);
  transition: opacity .2s ease;
}

/* Card */
.pf-card{
  grid-column: span 12;
  position:relative; overflow:hidden; border-radius:18px;
  border:1px solid var(--stroke);
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--card), transparent 8%), transparent),
    radial-gradient(120% 80% at 10% -10%, rgba(124,58,237,.10), transparent 70%),
    radial-gradient(120% 80% at 100% 110%, rgba(0,245,255,.08), transparent 70%);
  box-shadow: var(--shadow);
  transform-style:preserve-3d;
  transition: transform .26s cubic-bezier(.2,.8,.2,1), box-shadow .3s ease, filter .3s ease;
  will-change: transform, opacity, filter;
  content-visibility:auto;
  contain-intrinsic-size: 260px 320px;
}
.pf-card[data-assembling="1"]{ transition: none !important; }

.pf-card:hover{ transform: translateY(-4px) }
@media (hover:hover){
  .pf-card:hover{ transform: translateY(-4px) rotateX(.2deg) rotateY(.2deg) }
}

.pf-holo{
  position:absolute; inset:0; pointer-events:none; border-radius:inherit; mix-blend-mode:screen;
  background:
    conic-gradient(from 0deg, transparent 0 30%, rgba(0,245,255,.35), transparent 60% 100%),
    radial-gradient(80% 120% at 10% -10%, rgba(124,58,237,.16), transparent 60%);
  opacity:0; transition: opacity .5s ease;
}
.pf-card:hover .pf-holo{ opacity:1 }

.pf-dust{
  position:absolute; inset:-20%; pointer-events:none; mix-blend-mode:screen;
  background-image:
    radial-gradient(2px 2px at 20% 30%, rgba(0,245,255,.18) 40%, transparent 60%),
    radial-gradient(2px 2px at 80% 60%, rgba(124,58,237,.16) 40%, transparent 60%),
    radial-gradient(1.5px 1.5px at 60% 20%, rgba(0,245,255,.14) 40%, transparent 60%),
    radial-gradient(1.5px 1.5px at 30% 80%, rgba(124,58,237,.14) 40%, transparent 60%);
  filter: blur(0.3px);
  transform: translateZ(0) scale(1);
  animation: dustDrift 12s linear infinite;
}
@keyframes dustDrift { to { transform: translate3d(8px,-6px,0) scale(1.02) } }

/* Cover */
.pf-cover{
  display:block; position:relative; aspect-ratio:16/9; overflow:hidden; border-bottom:1px solid var(--stroke);
  border-top-left-radius: inherit; border-top-right-radius: inherit; will-change:opacity;
}
.pf-cover img{ width:100%; height:100%; object-fit:cover; display:block; transform: none !important; transition: none !important; }

/* scanline soft */
.pf-scan{
  content:""; position:absolute; inset:-40% -20% auto -20%; height:60%;
  background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,0));
  transform: translateY(-120%) rotate(10deg);
  filter: blur(6px);
  animation: scanPass 5.2s ease-in-out infinite;
  mix-blend-mode: screen; pointer-events:none;
}
@keyframes scanPass { 0%,15%{ transform: translateY(-120%) rotate(10deg) } 45%{ transform: translateY(120%) rotate(10deg) } 100%{ transform: translateY(120%) rotate(10deg) } }

.pf-body{ padding:16px }
.pf-title{ margin:0 0 6px; font-size:1.12rem; font-weight:900; letter-spacing:.2px }
.pf-title a{ color:inherit; text-decoration:none }
.pf-title a:hover{ text-decoration:underline }
.pf-meta{ margin:6px 0 6px }
.pf-desc{ margin:8px 0 0; color: color-mix(in oklab, var(--text) 78%, var(--muted)) }
.pf-kpi{ display:flex; flex-wrap:wrap; gap:8px; margin:10px 0 0; padding:0; list-style:none }
.kpi{ background: rgba(0,245,255,.14); color:var(--text); padding:4px 8px; border-radius:8px; font-weight:800 }
.pf-bullets{ margin:10px 0 0 18px }
.pf-cta{ margin-top:10px }
.pf-tags{ margin:12px 0 0; padding:0; list-style:none; display:flex; flex-wrap:wrap; gap:8px }
.pf-tags li{ background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02)); padding:4px 8px; border-radius:8px; border:1px solid var(--stroke) }

/* SKELETON */
.sk-card{ position:relative }
.sk-cover{ background:
  linear-gradient(180deg, color-mix(in oklab, var(--card), transparent 4%), transparent),
  repeating-linear-gradient( 45deg, color-mix(in oklab, var(--card), var(--stroke) 24%) 0 6px, transparent 6px 12px);
}
.sk-line{ height:12px; border-radius:8px; margin-top:10px; background: color-mix(in oklab, var(--card), var(--stroke) 32%); }
.sk-title{ height:16px; width:60%; }
.sk-meta{ width:40%; opacity:.9 }
.sk-text{ width:95% }
.sk-text.short{ width:70% }
.sk-tags{ margin-top:12px }
.sk-chip{ width:58px; height:22px; border-radius:10px; border:1px solid var(--stroke); background: color-mix(in oklab, var(--card), var(--stroke) 24%); }

/* Shimmer neon leggerissimo */
.shimmer{ position:relative; overflow:hidden }
.shimmer::after{
  content:""; position:absolute; inset:0; translate:-150% 0; /* parte fuori */
  background: linear-gradient(90deg,
    rgba(0,0,0,0) 0%,
    rgba(0,245,255,.18) 40%,
    rgba(124,58,237,.18) 60%,
    rgba(0,0,0,0) 100%);
  filter: blur(14px);
  animation: shimmerRun 1.25s linear infinite;
}
@keyframes shimmerRun { to { translate: 150% 0 } }

/* Shockwave wrapper (micro) */
.pf-grid.pf-shock{ animation: pfShock .44s cubic-bezier(.2,.8,.2,1) }
@keyframes pfShock{ 0%{ filter:brightness(1) saturate(1) } 18%{ filter:brightness(1.06) saturate(1.12) } 100%{ filter:none } }

/* Responsive: 1 → 2 → 3 colonne */
@media (min-width:576px){ .pf-card{ grid-column: span 6 } }
@media (min-width:992px){ .pf-card{ grid-column: span 4 } }
@media (min-width:1200px){ .pf-card{ grid-column: span 4 } }

/* A11y/perf */
@media (prefers-reduced-motion: reduce){
  .pf-grid.pf-shock{ animation:none !important }
  .pf-card{ transition:none !important }
  .pf-dust, .pf-scan, .shimmer::after{ animation: none !important }
}
</style>
