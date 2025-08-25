<template>
  <section class="section alt reveal" id="servizi" aria-labelledby="services-title">
    <!-- Aurora leggera -->
    <div class="srv-bg" aria-hidden="true"></div>

    <div class="container">
      <header class="section-head srv-head">
        <p class="eyebrow muted">Servizi</p>
        <h2 id="services-title">Come posso aiutarti</h2>
        <p>Dalla strategia al rilascio: processi chiari, iterazioni veloci, risultati misurabili.</p>
      </header>

      <div class="grid">
        <article
          v-for="(s, i) in services"
          :key="s.title"
          class="card srv-card"
          style="grid-column:span 4"
          :style="{'--i': i}"
        >
          <div class="srv-inner">
            <!-- Icona -->
            <div class="srv-ic" aria-hidden="true" v-html="s.icon"></div>

            <div class="card-body">
              <h3 class="card-title">{{ s.title }}</h3>
              <p class="card-desc">{{ s.desc }}</p>

              <!-- punti di valore opzionali -->
              <ul v-if="s.points?.length" class="srv-points">
                <li v-for="(p, k) in s.points" :key="k">{{ p }}</li>
              </ul>

              <!-- tag stack -->
              <ul v-if="s.tags?.length" class="card-tags">
                <li v-for="(t, x) in s.tags" :key="x">#{{ t }}</li>
              </ul>

              <div class="cta">
                <a class="btn ghost" href="#portfolio">Vedi casi reali</a>
                <a class="btn secondary" href="#contatti">Parliamone</a>
              </div>
            </div>
          </div>

          <!-- shine & conic glow -->
          <span class="srv-shine" aria-hidden="true"></span>
        </article>
      </div>

      <!-- mini-process (timeline) -->
      <div class="srv-process glass">
        <ol class="srv-steps" aria-label="Processo di lavoro">
          <li><span>1</span> Brief & Obiettivi</li>
          <li><span>2</span> Prototype & UX</li>
          <li><span>3</span> Dev & QA</li>
          <li><span>4</span> Launch & Measure</li>
        </ol>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * Servizi mirati per web developer
 * - Icone SVG inline (no dipendenze esterne)
 * - Points e Tags sono opzionali
 */
const services = [
  {
    title: "Siti & Landing",
    desc: "Interfacce ultra-veloci e SEO-first. Design responsive, build pulita e contenuti gestibili.",
    points: ["CWV 90+ mobile", "A11y AA", "Design system essenziale"],
    tags: ["Vue", "Vite", "Netlify"],
    icon: `
      <svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zM3 9h18M8 5v14" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    `,
  },
  {
    title: "Web App & Dashboard",
    desc: "Architetture scalabili in PHP + JS, API pulite e componenti riutilizzabili con UX “app-like”.",
    points: ["State management chiaro", "Audit performance", "Dark/light theme"],
    tags: ["PHP", "Vue", "D3.js"],
    icon: `
      <svg viewBox="0 0 24 24"><path d="M4 19V5h16v14M8 19V9h8v10" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    `,
  },
  {
    title: "Performance & SEO",
    desc: "Ottimizzazione Core Web Vitals, accessibilità e tracking affidabile per decisioni data-driven.",
    points: ["Lighthouse 90+", "Lazy/Code-split", "Schema & Analytics"],
    tags: ["CWV", "SEO", "A11y"],
    icon: `
      <svg viewBox="0 0 24 24"><path d="M3 12l4 4 6-8 8 12" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    `,
  },
  {
    title: "Integrazioni AI",
    desc: "Dove ha senso: assistenti, scoring, generazione contenuti. Sicurezza e controllo dei costi.",
    points: ["Prompting robusto", "Guardrail & logging", "Cache & batching"],
    tags: ["AI", "OpenAI", "Workers"],
    icon: `
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5 5l2.2 2.2M16.8 16.8L19 19M19 5l-2.2 2.2M5 19l2.2-2.2" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    `,
  },
  {
    title: "Ecommerce leggero",
    desc: "Cataloghi snelli, checkout semplice e performance stabili anche sotto carico.",
    points: ["DX per editor", "PageSpeed alti", "Tracking ROAS"],
    tags: ["Stripe", "Headless", "PWA"],
    icon: `
      <svg viewBox="0 0 24 24"><path d="M6 6h15l-2 9H7L6 6zM6 6l-2-2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg>
    `,
  },
  {
    title: "Manutenzione & QA",
    desc: "Cicli di release sicuri, monitoraggio e test. Ticket veloci e rollback sereni.",
    points: ["CI/CD", "Sentry/Logs", "Test E2E"],
    tags: ["GitHub", "Netlify", "Playwright"],
    icon: `
      <svg viewBox="0 0 24 24"><path d="M3 12h18M12 3v18M7 7h10v10H7z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    `,
  },
];
</script>

<style scoped>
/* Aurora di sezione */
.srv-bg{
  position:absolute; inset:0; pointer-events:none; z-index:0;
  background:
    radial-gradient(560px 280px at 18% 8%, rgba(124,58,237,.14), transparent),
    radial-gradient(560px 280px at 82% 92%, rgba(0,245,255,.12), transparent);
  animation: srvHue 22s linear infinite;
}
@keyframes srvHue { 50% { filter: hue-rotate(90deg) } }

.srv-head { position: relative; z-index: 1; }

/* Card servizio */
.srv-card{
  position: relative; overflow: hidden;
  transition: transform var(--t-med) ease, box-shadow var(--t-med) ease, border-color var(--t-med) ease, filter var(--t-med) ease;
  /* stagger reveal: variazione del delay all'entrata */
  opacity: 0; transform: translateY(16px);
  animation: srvIn .7s cubic-bezier(.2,.8,.2,1) forwards;
  animation-delay: calc(60ms * var(--i, 0));
}
@keyframes srvIn { to { opacity:1; transform:none } }

.srv-card:hover{ transform: translateY(-4px); box-shadow: 0 22px 60px rgba(0,0,0,.55); }
.srv-card::before{
  /* cornice conic glow */
  content:""; position:absolute; inset:0; padding:1px; border-radius: inherit;
  background: conic-gradient(from 0deg, transparent 0 30%, rgba(0,245,255,.28), transparent 60% 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  opacity: 0; transition: opacity var(--t-slow) ease;
}
.srv-card:hover::before{ opacity: 1; }

/* shine radiale */
.srv-shine{
  position:absolute; inset:-40%; pointer-events:none;
  background: radial-gradient(closest-side, rgba(0,245,255,.10), transparent 60%);
  filter: blur(22px);
  opacity:.0; transform: scale(.7); transition: opacity var(--t-med) ease, transform var(--t-slow) ease;
}
.srv-card:hover .srv-shine{ opacity:.8; transform: scale(1); }

/* contenuto */
.srv-inner{ display:flex; gap:14px; align-items:flex-start; }
.srv-ic{
  flex: 0 0 44px; width:44px; height:44px; border-radius:12px;
  display:grid; place-items:center;
  color: var(--primary);
  background: linear-gradient(180deg, color-mix(in oklab, var(--card), transparent 6%), transparent);
  border:1px solid var(--stroke);
  box-shadow: 0 10px 24px rgba(0,0,0,.22), inset 0 0 18px rgba(0,245,255,.12);
  transform: translateZ(0);
}
.srv-ic svg{ width:22px; height:22px; }

.card-desc{ margin: 6px 0 12px; }

/* bullets di valore */
.srv-points{ list-style: none; padding:0; margin: 6px 0 12px; }
.srv-points li{ position: relative; padding-left: 22px; color: var(--muted); }
.srv-points li::before{
  content:""; position:absolute; left:0; top:.5em; width:10px; height:10px; border-radius:50%;
  background: radial-gradient(closest-side, var(--primary), transparent);
  box-shadow: 0 0 10px var(--glow);
}

/* timeline processo */
.srv-process{
  margin-top: 22px; border-radius: var(--radius);
  border:1px solid var(--stroke); padding:10px 12px;
}
.srv-steps{
  display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px;
  counter-reset: step;
}
.srv-steps li{
  list-style:none; position:relative; padding:10px 12px; border-radius:12px;
  border:1px solid var(--stroke);
  background: linear-gradient(180deg, color-mix(in oklab, var(--card), transparent 6%), transparent);
  display:flex; align-items:center; gap:8px; color: var(--muted);
  transition: transform var(--t-fast) ease, box-shadow var(--t-med) ease;
}
.srv-steps li:hover{ transform: translateY(-2px); box-shadow: 0 10px 26px rgba(0,0,0,.28); }
.srv-steps li span{
  display:inline-grid; place-items:center; width:22px; height:22px; border-radius:50%;
  background: color-mix(in oklab, var(--primary), #000 8%); color:#061017; font-weight:800; font-size:12px;
}

/* responsive */
@media (max-width: 980px){
  /* 12-col grid -> 2 per riga */
  .srv-card[style]{ grid-column: span 6 !important; }
  .srv-steps{ grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px){
  /* 12-col grid -> 1 per riga */
  .srv-card[style]{ grid-column: span 12 !important; }
  .srv-inner{ flex-direction: row; }
  .srv-steps{ grid-template-columns: 1fr; }
}

/* reduce motion */
@media (prefers-reduced-motion: reduce){
  .srv-card, .srv-card::before, .srv-shine { animation: none !important; transition: none !important; }
}
</style>
