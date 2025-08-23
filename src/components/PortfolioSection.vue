<script>
export default {
  name: "PortfolioSection",

  data() {
    return {
      activeTag: "",

      // 🔹 Dati dei progetti
      projects: [
        {
          title: "Portfolio Personale",
          slug: "portfolio-personale",
          type: "public",
          featured: true,
          year: 2025,
          excerpt: "Il mio sito personale: design moderno, spotlight interattivo e filtri portfolio.",
          url: "https://example.com",
          cover: "cover-1.jpg", // se l'immagine è in src/assets/img/
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
          challenge: [
            "Allineare la pianificazione tra più stabilimenti",
            "Ridurre i tempi di ciclo non monitorati",
          ],
          approach: [
            "Ottimizzazione query MySQL + caching",
            "Eventi asincroni per aggiornamenti KPI",
            "Ruoli e permessi granulari",
          ],
          impact: ["Tempo ciclo ordine −27%", "Report KPI < 500ms p95", "Errori inserimento dati −40%"],
          cover: "abstract-kpi.jpg",
          tags: ["php", "mysql", "performance", "crm"],
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
          challenge: [
            "Mancanza di visibilità sullo stato dei lead",
            "Processi manuali per follow-up",
          ],
          approach: [
            "Pipeline drag&drop in JS",
            "Reminder automatici via cron job",
            "Integrazione email transazionali",
          ],
          impact: ["+22% lead convertiti", "Follow-up automatizzati (−80% errori)", "Visibilità completa ciclo vendite"],
          cover: "abstract-crm.jpg",
          tags: ["crm", "automation", "php", "js"],
        },
      ],
    };
  },

  computed: {
    // 🔹 Calcola la lista di tag disponibili
    allTags() {
      const set = new Set();
      this.projects.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    },

    // 🔹 Applica il filtro per tag
    filtered() {
      if (!this.activeTag) return this.projects;
      return this.projects.filter((p) => p.tags?.includes(this.activeTag));
    },
  },

  mounted() {
    // 🔹 Leggi il tag dalla querystring (es. ?tag=vue#portfolio)
    const params = new URLSearchParams(window.location.search);
    const tag = params.get("tag");
    if (tag && this.allTags.includes(tag)) {
      this.activeTag = tag;
    }
  },

  methods: {
    // 🔹 Controlli di visibilità
    isPublic(p) {
      return p.type === "public" && !p.nda;
    },
    isNDA(p) {
      return p.nda === true || p.type === "case_study";
    },

    // 🔹 Gestione tag + URL
    setTag(tag) {
      this.activeTag = tag;
      const url = new URL(window.location.href);
      if (tag) url.searchParams.set("tag", tag);
      else url.searchParams.delete("tag");
      url.hash = "#portfolio";
      window.history.replaceState({}, "", url.toString());
    },

    // 🔹 Risoluzione robusta della cover (public/ vs src/assets/img/)
    coverSrc(p) {
      const c = p.cover || "";
      if (/^https?:\/\//i.test(c)) return c;              // URL assoluto
      if (c.startsWith("/")) return c;                    // da /public
      // altrimenti la cerchiamo in src/assets/img/
      try {
        return new URL(`../assets/img/${c}`, import.meta.url).href;
      } catch {
        // fallback
        return "/assets/img/cover-1.jpg";
      }
    },
  },
};
</script>

<template>
  <!-- PORTFOLIO -->
  <section id="portfolio" class="section" aria-labelledby="portfolio-title">
    <div class="container">
      <header class="section-head">
        <h2 id="portfolio-title">Portfolio</h2>
        <p>
          Selezione di lavori recenti: <strong>pubblici</strong> e
          <strong>case study NDA-safe</strong>. Filtra per competenza.
        </p>

        <div class="tags" role="tablist" aria-label="Filtri portfolio">
          <a
            class="tag"
            :class="{ active: activeTag === '' }"
            href="#portfolio"
            @click.prevent="setTag('')"
            >Tutti</a
          >
          <a
            v-for="t in allTags"
            :key="t"
            class="tag"
            :class="{ active: activeTag === t }"
            :href="`?tag=${encodeURIComponent(t)}#portfolio`"
            @click.prevent="setTag(t)"
            >#{{ t }}</a
          >
        </div>
      </header>

      <div class="grid">
        <p v-if="filtered.length === 0" class="muted">
          Nessun progetto disponibile per questo filtro.
        </p>

        <article
          v-for="p in filtered"
          :key="p.slug || p.title"
          class="card"
          data-tilt
          style="grid-column: span 6"
        >
          <!-- Cover -->
          <template v-if="isPublic(p)">
            <a class="card-cover" :href="p.url" target="_blank" rel="noopener">
              <img
                :src="coverSrc(p)"
                :alt="`Anteprima: ${p.title}`"
                loading="lazy"
                decoding="async"
              />
            </a>
          </template>
          <template v-else>
            <div class="card-cover">
              <img
                :src="coverSrc(p)"
                alt="Illustrazione astratta del case study"
                loading="lazy"
                decoding="async"
              />
            </div>
          </template>

          <!-- Body -->
          <div class="card-body">
            <h3 class="card-title">
              <a
                v-if="p.url && isPublic(p)"
                :href="p.url"
                target="_blank"
                rel="noopener"
                >{{ p.title }}</a
              >
              <RouterLink v-else-if="p.slug" :to="`/project/${p.slug}`">{{
                p.title
              }}</RouterLink>
              <template v-else>{{ p.title }}</template>
            </h3>

            <p v-if="p.industry || p.year || p.role" class="muted" style="margin: 0 0 6px">
              <template v-if="p.industry">{{ p.industry }}</template>
              <template v-if="p.year"> • {{ p.year }}</template>
              <template v-if="p.role"> • {{ p.role }}</template>
            </p>

            <p v-if="p.excerpt" class="card-desc">{{ p.excerpt }}</p>

            <!-- NDA extras -->
            <template v-if="isNDA(p)">
              <ul v-if="p.impact?.length" class="kpi-list">
                <li v-for="(i, k) in p.impact" :key="k">
                  <span class="kpi-badge">{{ i }}</span>
                </li>
              </ul>
              <ul v-if="p.approach?.length" class="bullets">
                <li v-for="(a, i) in p.approach" :key="i">{{ a }}</li>
              </ul>
              <p class="muted" style="margin-top: 8px">
                NDA: UI e dati non pubblicabili.
                <a href="mailto:hello@example.com?subject=Richiesta%20demo%20case%20study"
                  >Richiedi demo</a
                >.
              </p>
            </template>

            <!-- CTA -->
            <div v-if="!isNDA(p) && p.url" class="cta" style="margin-top: 10px">
              <a class="btn ghost" :href="p.url" target="_blank" rel="noopener">Visita il sito</a>
              <RouterLink v-if="p.slug" class="btn ghost" :to="`/project/${p.slug}`"
                >Dettagli</RouterLink
              >
            </div>

            <!-- Tag del progetto -->
            <ul v-if="p.tags?.length" class="card-tags" aria-label="Tag progetto">
              <li v-for="(t, i) in p.tags" :key="i">#{{ t }}</li>
            </ul>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Layout base */
.section { padding: 48px 0; }
.section-head { margin-bottom: 24px; }
.section-head h2 { margin-bottom: 8px; }

.tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.tag {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 24px;
  background: #f1f1f1;
  color: #222;
  text-decoration: none;
  font-weight: 600;
  transition: background .2s ease, color .2s ease;
}
.tag:hover { background: #111; color: #fff; }
.tag.active { background: #111; color: #fff; }

.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.card {
  grid-column: span 12;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0,0,0,.08);
  transition: transform .2s ease, box-shadow .2s ease;
}
.card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(0,0,0,.12); }

.card-cover img { width: 100%; height: auto; display: block; }

.card-body { padding: 16px; }
.card-title { margin: 0 0 6px; font-size: 1.1rem; }
.card-title a { color: inherit; text-decoration: none; }
.card-title a:hover { text-decoration: underline; }
.card-desc { margin: 8px 0 0; }

.kpi-list { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0 0; padding: 0; list-style: none; }
.kpi-badge { background: #eef7ff; color: #0a66c2; padding: 4px 8px; border-radius: 8px; font-weight: 700; }

.bullets { margin: 10px 0 0 18px; }
.bullets li { margin-bottom: 4px; }

.card-tags { margin: 12px 0 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 8px; }
.card-tags li { background: #f6f6f6; padding: 4px 8px; border-radius: 6px; }

/* Responsive */
@media (min-width: 576px) {
  .card { grid-column: span 6; }
}
@media (min-width: 992px) {
  .card { grid-column: span 4; }
}
@media (min-width: 1200px) {
  .card { grid-column: span 3; }
}
</style>
