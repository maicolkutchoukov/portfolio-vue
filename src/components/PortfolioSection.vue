<script>
import { projects } from "@/data/projects";

export default {
  name: "PortfolioSection",

  data() {
    return {
      activeTag: "",
      projects,
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
    // ?tag=...
    const params = new URLSearchParams(window.location.search);
    const tag = params.get("tag");
    if (tag && this.allTags.includes(tag)) this.activeTag = tag;

    // Punto ripple sul wrapper
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

    this._cleanup = () => {
      grid.removeEventListener("pointermove", onMove);
      grid.removeEventListener("pointerdown", onDown);
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
      // Shockwave leggero sul wrapper
      const grid = this.$refs.gridEl ?? document.querySelector("#portfolio .pf-grid");
      if (grid instanceof HTMLElement) { grid.classList.remove("pf-shock"); void grid.offsetWidth; grid.classList.add("pf-shock"); }

      // Esplodi tutte le card correnti
      const cards = Array.from(document.querySelectorAll("#portfolio .pf-card"));
      const shatters = cards.map((el) => this._shatter(el));
      await Promise.allSettled(shatters);

      // Aggiorna filtro
      this.activeTag = tag;
      const url = new URL(window.location.href);
      if (tag) url.searchParams.set("tag", tag); else url.searchParams.delete("tag");
      url.hash = "#portfolio";
      window.history.replaceState({}, "", url.toString());

      await this.$nextTick();

      // Ricomponi le nuove card
      const nextCards = Array.from(document.querySelectorAll("#portfolio .pf-card"));
      nextCards.forEach((c) => {
        c.dataset.assembling = "1"; // disabilita qualsiasi hover/zoom
        c.style.visibility = "hidden";
      });
      const assembles = nextCards.map((el) => this._assemble(el));
      await Promise.allSettled(assembles);
      nextCards.forEach((c) => {
        c.style.visibility = "";
        delete c.dataset.assembling;
      });
    },

    // ===== SHATTER (uscita) =====
    _shatter(el) {
      return new Promise((resolve) => {
        try {
          el.style.visibility = "hidden";

          const cover = el.querySelector(".pf-cover");
          const img   = el.querySelector(".pf-cover img");
          const target = (cover instanceof HTMLElement ? cover : el);
          const rect = target.getBoundingClientRect();
          const src  = img?.currentSrc || img?.src;

          const cardRadius = getComputedStyle(el).borderRadius || "18px";
          const overlay = document.createElement("div");
          overlay.className = "pf-expl";
          Object.assign(overlay.style, {
            position: "fixed", left: rect.left + "px", top: rect.top + "px",
            width: rect.width + "px", height: rect.height + "px",
            pointerEvents: "none", zIndex: 9999, contain: "strict",
            overflow: "hidden", borderRadius: cardRadius,
          });
          document.body.appendChild(overlay);

          const mqMobileShatter = window.matchMedia("(max-width: 768px)").matches;
          const COLS = mqMobileShatter ? Math.max(5, Math.round(rect.width / 180)) : Math.max(7, Math.min(10, Math.round(rect.width / 140)));
          const ROWS = mqMobileShatter ? Math.max(3, Math.round(rect.height / 160)) : Math.max(4, Math.min(7,  Math.round(rect.height / 120)));
          const w = rect.width / COLS, h = rect.height / ROWS;

          // centro esplosione
          const grid = this.$refs.gridEl ?? document.querySelector("#portfolio .pf-grid");
          let cx = rect.width / 2, cy = rect.height / 2;
          if (grid instanceof HTMLElement) {
            const css = getComputedStyle(grid);
            const mx = parseFloat(css.getPropertyValue("--mx")) / 100 * grid.clientWidth;
            const my = parseFloat(css.getPropertyValue("--my")) / 100 * grid.clientHeight;
            const gRect = grid.getBoundingClientRect();
            cx = Math.min(Math.max(mx + gRect.left - rect.left, 0), rect.width);
            cy = Math.min(Math.max(my + gRect.top  - rect.top , 0), rect.height);
          }

          const frag = document.createDocumentFragment();
          const shards = [];
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const shard = document.createElement("div");
              const x = c * w, y = r * h;
              Object.assign(shard.style, {
                position:"absolute", left:x + "px", top:y + "px", width:w + "px", height:h + "px",
                willChange:"transform, opacity, filter", backfaceVisibility:"hidden",
                transformOrigin:"center center", borderRadius:"2px", overflow:"hidden",
              });
              if (src) {
                Object.assign(shard.style, {
                  backgroundImage:`url("${src}")`,
                  backgroundSize:`${rect.width}px ${rect.height}px`,
                  backgroundPosition:`-${x}px -${y}px`,
                  backgroundRepeat:"no-repeat",
                });
              } else {
                shard.style.background = "linear-gradient(135deg, rgba(122,162,255,.25), rgba(47,214,183,.18))";
              }
              frag.appendChild(shard);
              shards.push({ node: shard, cxLocal: x + w/2, cyLocal: y + h/2 });
            }
          }
          overlay.appendChild(frag);

          const maxDist = Math.hypot(Math.max(cx, rect.width - cx), Math.max(cy, rect.height - cy));
          const baseDur = mqMobileShatter ? 360 : 440, varDur = mqMobileShatter ? 140 : 200;

          const animations = shards.map(({ node, cxLocal, cyLocal }, i) => {
            const dx = cxLocal - cx, dy = cyLocal - cy;
            const dist = Math.hypot(dx, dy) || 1, norm = dist / maxDist;

            const ux = (dx / dist) + (Math.random() - 0.5) * 0.22;
            const uy = (dy / dist) + (Math.random() - 0.5) * 0.22;

            const spread = (mqMobileShatter ? 100 : 130) + (mqMobileShatter ? 140 : 200) * norm;
            const zLift  = (mqMobileShatter ? 50 : 70) + (mqMobileShatter ? 90 : 120) * Math.random();

            const rotX = (Math.random() * 2 - 1) * (28 + 36 * norm);
            const rotY = (Math.random() * 2 - 1) * (28 + 36 * norm);
            const rotZ = (Math.random() * 2 - 1) * (50 + 100 * Math.random());

            const delay = mqMobileShatter ? 0 : 5 * (i % COLS);
            const duration = baseDur + Math.random() * varDur;

            return node.animate(
              [
                { opacity:1, transform:"translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0)", filter:"blur(0px)" },
                { opacity:0, transform:`translate3d(${ux*spread}px, ${uy*spread}px, ${zLift}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`, filter:"blur(4px)" },
              ],
              { duration, delay, easing:"cubic-bezier(.22,.82,.22,1)", fill:"forwards" }
            );
          });

          overlay.animate(
            [{ filter:"drop-shadow(0 0 0 rgba(0,245,255,0))" },
             { filter:"drop-shadow(0 0 18px rgba(0,245,255,.22))" },
             { filter:"drop-shadow(0 0 0 rgba(0,245,255,0))" }],
            { duration: baseDur + varDur, easing:"ease-out", fill:"forwards" }
          );

          Promise.allSettled(animations.map(a => a.finished)).then(() => { overlay.remove(); resolve(); });
        } catch {
          el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill:"forwards" }).finished.finally(resolve);
        }
      });
    },

    // ===== ASSEMBLE (entrata) — senza zoom né spark =====
    _assemble(el) {
      return new Promise(async (resolve) => {
        try {
          el.style.visibility = "";
          const coverEl = el.querySelector(".pf-cover");
          const img     = el.querySelector(".pf-cover img");
          const bodyEl  = el.querySelector(".pf-body");

          // Pre-decode immagine (anti-flicker)
          try { if (img?.decode) await img.decode(); } catch {}

          // Stato iniziale coerente + no-zoom
          const cardRadius = getComputedStyle(el).borderRadius || "18px";
          if (coverEl) {
            coverEl.style.opacity = "0";
            coverEl.style.willChange = "opacity";
            coverEl.style.borderTopLeftRadius = cardRadius;
            coverEl.style.borderTopRightRadius = cardRadius;
          }
          if (img) {
            img.style.transform = "none";              // nessun zoom base
            img.style.transition = "none";             // evita qualsiasi transizione residua
          }
          if (bodyEl)  {
            bodyEl.style.opacity  = "0";
            bodyEl.style.willChange = "opacity, transform, filter";
            bodyEl.style.transform = "translateY(8px)";
            bodyEl.style.filter = "blur(1.5px)";
          }

          const target = (coverEl instanceof HTMLElement ? coverEl : el);
          const rect = target.getBoundingClientRect();
          const src  = img?.currentSrc || img?.src;

          // overlay corner-matched
          const overlay = document.createElement("div");
          overlay.className = "pf-expl";
          Object.assign(overlay.style, {
            position:"fixed", left:rect.left+"px", top:rect.top+"px",
            width:rect.width+"px", height:rect.height+"px",
            pointerEvents:"none", zIndex:9999, contain:"strict", overflow:"hidden",
            borderTopLeftRadius:cardRadius, borderTopRightRadius:cardRadius,
            borderBottomLeftRadius:cardRadius, borderBottomRightRadius:cardRadius,
          });
          document.body.appendChild(overlay);

          const mqMobileAssemble = window.matchMedia("(max-width: 768px)").matches;
          const COLS = mqMobileAssemble ? Math.max(5, Math.round(rect.width / 180)) : Math.max(7, Math.min(10, Math.round(rect.width / 140)));
          const ROWS = mqMobileAssemble ? Math.max(3, Math.round(rect.height / 160)) : Math.max(4, Math.min(7,  Math.round(rect.height / 120)));
          const w = rect.width / COLS, h = rect.height / ROWS;

          // centro implosione
          const grid = this.$refs.gridEl ?? document.querySelector("#portfolio .pf-grid");
          let cx = rect.width / 2, cy = rect.height / 2;
          if (grid instanceof HTMLElement) {
            const css = getComputedStyle(grid);
            const mx = parseFloat(css.getPropertyValue("--mx")) / 100 * grid.clientWidth;
            const my = parseFloat(css.getPropertyValue("--my")) / 100 * grid.clientHeight;
            const gRect = grid.getBoundingClientRect();
            cx = Math.min(Math.max(mx + gRect.left - rect.left, 0), rect.width);
            cy = Math.min(Math.max(my + gRect.top  - rect.top , 0), rect.height);
          }

          const frag = document.createDocumentFragment();
          const shards = [];
          for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
              const shard = document.createElement("div");
              const x = c * w, y = r * h;
              Object.assign(shard.style, {
                position:"absolute", left:x + "px", top:y + "px", width:w + "px", height:h + "px",
                willChange:"transform, opacity, filter", backfaceVisibility:"hidden",
                transformOrigin:"center center", borderRadius:"2px", overflow:"hidden",
              });
              if (src) {
                Object.assign(shard.style, {
                  backgroundImage:`url("${src}")`,
                  backgroundSize:`${rect.width}px ${rect.height}px`,
                  backgroundPosition:`-${x}px -${y}px`,
                  backgroundRepeat:"no-repeat",
                });
              } else {
                shard.style.background = "linear-gradient(135deg, rgba(122,162,255,.25), rgba(47,214,183,.18))";
              }
              frag.appendChild(shard);
              shards.push({ node: shard, centerX: x + w/2, centerY: y + h/2 });
            }
          }
          overlay.appendChild(frag);

          const baseDur = mqMobileAssemble ? 400 : 500, varDur = mqMobileAssemble ? 160 : 220;
          const maxSpread = Math.hypot(rect.width, rect.height) * (mqMobileAssemble ? 0.26 : 0.33);

          // Warm-up (2 frame) per pipeline stabile
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

          // Implosione
          const shardAnims = shards.map(({ node, centerX, centerY }, i) => {
            const dx = centerX - cx, dy = centerY - cy;
            const dist = Math.hypot(dx, dy) || 1;
            const ux = dx / dist, uy = dy / dist;

            const startX = -ux * (maxSpread + Math.random() * 110);
            const startY = -uy * (maxSpread + Math.random() * 110);

            const rotX = (Math.random() * 2 - 1) * 40;
            const rotY = (Math.random() * 2 - 1) * 40;
            const rotZ = (Math.random() * 2 - 1) * 100;

            const delay = mqMobileAssemble ? 0 : 4 * (i % COLS);
            const duration = baseDur + Math.random() * varDur;

            return node.animate(
              [
                { opacity:0, transform:`translate3d(${startX}px, ${startY}px, 100px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`, filter:"blur(5px)" },
                { opacity:1, transform:"translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0)", filter:"blur(0px)" },
              ],
              { duration, delay, easing:"cubic-bezier(.2,.8,.2,1)", fill:"forwards" }
            );
          });

          // Corpo in parallelo (morbido)
          bodyEl?.animate(
            [{ opacity:0, transform:"translateY(8px)", filter:"blur(1.5px)" },
             { opacity:1, transform:"translateY(0)",   filter:"blur(0)" }],
            { duration: baseDur + 100, delay: 90, easing:"cubic-bezier(.2,.8,.2,1)", fill:"forwards" }
          );

          // Glow leggero (cheap)
          overlay.animate(
            [{ filter:"drop-shadow(0 0 0 rgba(124,58,237,0))" },
             { filter:"drop-shadow(0 0 16px rgba(124,58,237,.22))" },
             { filter:"drop-shadow(0 0 0 rgba(124,58,237,0))" }],
            { duration: baseDur + varDur, easing:"ease-out", fill:"forwards" }
          );

          // Crossfade breve e disabilitazione hover fino a fine ricomposizione
          Promise.allSettled(shardAnims.map(a => a.finished)).then(async () => {
            if (coverEl) {
              coverEl.style.transition = "opacity .18s ease";
              coverEl.style.opacity = "1";
              await new Promise(r => setTimeout(r, 120));
            }
            overlay.remove();
            resolve();
          });
        } catch {
          el.style.visibility = "";
          const bodyEl = el.querySelector(".pf-body");
          bodyEl?.animate(
            [{ opacity:0, transform:"translateY(8px)" }, { opacity:1, transform:"translateY(0)" }],
            { duration: 240, easing:"cubic-bezier(.2,.8,.2,1)", fill:"forwards" }
          ).finished.finally(resolve);
        }
      });
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

      <div class="grid pf-grid" ref="gridEl">
        <div class="pf-grid-inner">
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
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* =========================================================
   FUTURE-GLASS PORTFOLIO — ultra fluido, senza zoom & 3-col
   ========================================================= */
@property --r { syntax: "<length>"; inherits: false; initial-value: 0px; }
@property --slice { syntax: "<length>"; inherits: false; initial-value: 0px; }

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
.pf-grid{ --mx:50%; --my:50%; }
.grid{ display:grid; grid-template-columns:repeat(12,1fr); gap:18px }
.pf-grid-inner{ display:contents }

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
  transition: transform .36s cubic-bezier(.2,.8,.2,1), box-shadow .36s ease, filter .36s ease;
  will-change: transform, opacity, filter;
  content-visibility:auto;
  contain-intrinsic-size: 260px 320px;
}
/* durante assemble disabilito qualsiasi hover-raise */
.pf-card[data-assembling="1"]{ transition: none !important; }

.pf-card:hover{ transform: translateY(-4px) }
@media (hover:hover){
  .pf-card:hover{ transform: translateY(-4px) rotateX(.2deg) rotateY(.2deg) }
}

.pf-holo{
  position:absolute; inset:0; pointer-events:none; border-radius:inherit;
  background:
    conic-gradient(from 0deg, transparent 0 30%, rgba(0,245,255,.35), transparent 60% 100%),
    radial-gradient(80% 120% at 10% -10%, rgba(124,58,237,.16), transparent 60%);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor; mask-composite:exclude;
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

/* Cover — zero zoom SEMPRE (anche su hover) */
.pf-cover{
  display:block; position:relative; aspect-ratio:16/9; overflow:hidden; border-bottom:1px solid var(--stroke);
  border-top-left-radius: inherit; border-top-right-radius: inherit; will-change:opacity;
}
.pf-cover img{
  width:100%; height:100%; object-fit:cover; display:block;
  transform: none !important;         /* <- vieta qualsiasi zoom */
  transition: none !important;        /* <- niente transizioni che possano “saltare” */
  image-rendering:auto;
}

/* scanline soft (solo estetica) */
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

/* Shockwave wrapper */
.pf-grid.pf-shock{ animation: pfShock .44s cubic-bezier(.2,.8,.2,1) }
@keyframes pfShock{
  0%{ filter:brightness(1) saturate(1) }
  18%{ filter:brightness(1.06) saturate(1.12) }
  100%{ filter:none }
}

/* Responsive: 1 → 2 → 3 colonne */
@media (min-width:576px){ .pf-card{ grid-column: span 6 } }
@media (min-width:992px){ .pf-card{ grid-column: span 4 } } /* = 3 per riga */
@media (min-width:1200px){ .pf-card{ grid-column: span 4 } }

/* A11y/perf */
@media (prefers-reduced-motion: reduce){
  .pf-grid.pf-shock{ animation:none !important }
}
</style>
