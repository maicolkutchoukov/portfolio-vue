<template>
  <section class="hero section reveal" aria-labelledby="hero-title">

    <!-- Aurora / background -->
    <div class="hero-bg" aria-hidden="true"></div>

    <div class="container hero-inner">
      <!-- COPY -->
      <div class="hero-copy">
        <p class="eyebrow availability">
          <span class="dot"></span> Disponibile per nuove collaborazioni
        </p>

        <h1 id="hero-title">
          Realizzo prodotti digitali
          <span class="accent">veloci</span>, <span class="accent">accessibili</span>
          e <span class="accent">memorabili</span>.
        </h1>

        <p class="lead">
          Sviluppatore PHP / Frontend. Dal concept al lancio:
          UX, performance, SEO e componenti riutilizzabili. Integro AI dove ha senso.
        </p>

        <div class="cta">
          <a class="btn primary" href="#contatti" aria-label="Contattami per il tuo progetto">
            <svg class="btn-ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h18M3 12h12M3 18h18" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
            Parliamo del tuo progetto
          </a>
          <a class="btn ghost" href="#portfolio" aria-label="Vai al mio portfolio">
            Vedi il portfolio
            <svg class="btn-ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" />
            </svg>
          </a>
        </div>

        <!-- BADGES -->
        <ul class="badges" aria-label="Competenze principali">
          <li>PHP 7/8</li><li>Laravel / Slim</li><li>MySQL</li>
          <li>JS / Vue / React</li><li>UX • SEO • Performance</li>
        </ul>

        <!-- METRICHE / SOCIAL PROOF -->
        <div class="kpis" aria-label="Risultati principali">
          <div class="kpi-card glass">
            <span class="kpi" :data-target="2" ref="yearsRef">0</span>
            <span class="kpi-label">anni di esperienza</span>
          </div>
          <div class="kpi-card glass">
            <span class="kpi" :data-target="15" ref="projectsRef">0</span>
            <span class="kpi-label">progetti lanciati</span>
          </div>
          <div class="kpi-card glass">
            <span class="kpi" :data-target="98" ref="lighthouseRef">0</span>
            <span class="kpi-label">Lighthouse score ↑</span>
          </div>
        </div>
      </div>

      <!-- MEDIA / AVATAR -->
      <div class="hero-media" aria-hidden="true">
        <figure class="avatar-wrap card-3d">
          <!-- Orbite neon -->
          <svg class="orbit orbit-1" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="var(--primary)"/>
                <stop offset="100%" stop-color="var(--accent)"/>
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r="150" fill="none" stroke="url(#grad1)" stroke-width="2" filter="url(#glow)" />
          </svg>

          <svg class="orbit orbit-2" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(0,245,255,.45)" stroke-width="1.2" stroke-dasharray="6 10"/>
          </svg>

          <img :src="avatarUrl" alt="Ritratto autore" loading="eager" decoding="async" class="avatar" />

          <!-- Chip tecnologici fluttuanti -->
          <span class="chip chip-a">Vue</span>
          <span class="chip chip-b">Laravel</span>
          <span class="chip chip-c">MySQL</span>
          <span class="chip chip-d">D3.js</span>
        </figure>
      </div>
    </div>

    <!-- Scroll cue -->
    <button class="scroll-cue" aria-label="Scorri per scoprire i progetti" @click="scrollTo('#portfolio')">
      <span class="wheel"></span>
    </button>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import avatarUrl from '@/assets/img/avatar.jpg'

// simple counter animation
const yearsRef = ref(null)
const projectsRef = ref(null)
const lighthouseRef = ref(null)

function animateCounter(el, target, duration = 1100) {
  if (!el) return
  const start = 0
  const startTime = performance.now()
  const step = (now) => {
    const p = Math.min((now - startTime) / duration, 1)
    const ease = 1 - Math.pow(1 - p, 3) // easeOutCubic
    el.textContent = Math.round(start + (target - start) * ease)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function scrollTo(selector) {
  const el = document.querySelector(selector)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let io
function onIntersect(entries) {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      const y = Number(yearsRef.value?.dataset.target || 8)
      const p = Number(projectsRef.value?.dataset.target || 150)
      const l = Number(lighthouseRef.value?.dataset.target || 98)
      animateCounter(yearsRef.value, y, 900)
      animateCounter(projectsRef.value, p, 1100)
      animateCounter(lighthouseRef.value, l, 900)
      io?.disconnect()
    }
  })
}

onMounted(() => {
  // attiva contatori quando la hero è visibile
  io = new IntersectionObserver(onIntersect, { threshold: 0.4 })
  const section = document.querySelector('.hero')
  section && io.observe(section)

  // leggero tilt su avatar
  const wrap = document.querySelector('.avatar-wrap')
  if (!wrap) return
  let raf = 0
  const onMove = (e) => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      const rect = wrap.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      wrap.style.setProperty('--rx', (dy * 6).toFixed(2) + 'deg')
      wrap.style.setProperty('--ry', (dx * -8).toFixed(2) + 'deg')
      raf = 0
    })
  }
  window.addEventListener('mousemove', onMove, { passive: true })
  // store for cleanup
  wrap._onMove = onMove
})

onBeforeUnmount(() => {
  io?.disconnect()
  const wrap = document.querySelector('.avatar-wrap')
  if (wrap?._onMove) window.removeEventListener('mousemove', wrap._onMove)
})
</script>

<style scoped>
/* Integrazione con il tuo tema globale */
.hero { position: relative; padding: 108px 0; }
.hero-inner { display: grid; grid-template-columns: 1.15fr .85fr; gap: 32px; align-items: center; }

.availability { display: inline-flex; align-items: center; gap: 10px; margin: 0 0 6px; color: var(--muted); }
.availability .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 0 0 color-mix(in oklab, var(--primary), #000 35%); animation: ping 1.6s infinite; }
@keyframes ping { 0%{ box-shadow: 0 0 0 0 rgba(0,245,255,.55)} 70%{ box-shadow: 0 0 0 12px rgba(0,245,255,0)} 100%{ box-shadow: 0 0 0 0 rgba(0,245,255,0)} }

.lead { max-width: 56ch; }

/* CTA icone */
.btn-ic { width: 18px; height: 18px; margin: -2px 0 0 0; }

/* KPI */
.kpis { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; margin-top: 18px; }
.kpi-card { text-align: center; padding: 14px; border-radius: 14px; border: 1px solid var(--stroke); position: relative; overflow: hidden; }
.kpi-card::after{ content:""; position:absolute; inset:-30%; background: radial-gradient(closest-side, rgba(0,245,255,.08), transparent 60%); filter: blur(20px); opacity: .0; transition: opacity .35s ease; }
.kpi-card:hover::after{ opacity:.8; }
.kpi { display:block; font-weight: 1000; font-size: 28px; line-height: 1; }
.kpi-label { display:block; color: var(--muted); font-size: 13px; margin-top: 6px; }

/* MEDIA */
.hero-media { position: relative; }
.avatar-wrap {
  position: relative;
  width: min(440px, 90%);
  margin: 0 auto;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--stroke);
  transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform .6s cubic-bezier(.2,.8,.2,1);
  will-change: transform;
  background:
    radial-gradient(800px 360px at 70% 20%, rgba(124,58,237,.18), transparent),
    radial-gradient(700px 320px at 30% 80%, rgba(47,214,183,.16), transparent),
    color-mix(in oklab, var(--card), transparent 0%);
}
.avatar { display:block; width:100%; height:auto; aspect-ratio: 1/1; object-fit: cover; }

.orbit { position: absolute; inset: 0; pointer-events: none; }
.orbit-1 { animation: spin 16s linear infinite; }
.orbit-2 { transform: scale(.85); animation: spin-rev 22s linear infinite; opacity: .75; }
@keyframes spin { to { transform: rotate(360deg) } }
@keyframes spin-rev { to { transform: rotate(-360deg) } }

/* Chips tecnologici */
.chip {
  position: absolute;
  backdrop-filter: blur(6px) saturate(140%);
  background: linear-gradient(180deg, color-mix(in oklab, var(--card), transparent 6%), transparent);
  border: 1px solid var(--stroke);
  color: var(--text);
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  box-shadow: 0 10px 24px rgba(0,0,0,.22);
  white-space: nowrap;
}
.chip-a { left: 6%; top: 10%; animation: floatA 6s ease-in-out infinite; }
.chip-b { right: 8%; top: 18%; animation: floatB 7s ease-in-out infinite; }
.chip-c { left: 10%; bottom: 12%; animation: floatB 7.5s ease-in-out infinite; }
.chip-d { right: 12%; bottom: 8%; animation: floatA 6.5s ease-in-out infinite; }

@keyframes floatA { 0%,100%{ transform: translateY(0)} 50%{ transform: translateY(-6px)} }
@keyframes floatB { 0%,100%{ transform: translateY(0)} 50%{ transform: translateY(6px)} }

/* Scroll cue */
.scroll-cue{
  position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%);
  width: 28px; height: 44px; border-radius: 16px; border: 2px solid color-mix(in oklab, var(--primary), #fff 15%);
  background: transparent; cursor: pointer; opacity: .85;
}
.scroll-cue .wheel{
  position: absolute; left: 50%; top: 8px; width: 4px; height: 8px; border-radius: 2px; background: var(--primary); transform: translateX(-50%);
  animation: wheel 1.4s ease-in-out infinite;
}
@keyframes wheel{ 0%{ transform: translate(-50%, 0); opacity:1 } 80%{ opacity:0 } 100%{ transform: translate(-50%, 14px); opacity:0 } }

/* Responsive */
@media (max-width: 980px){
  .hero-inner { grid-template-columns: 1fr; gap: 26px; }
  .avatar-wrap { width: min(380px, 100%); }
  .kpis { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 720px){
  .kpis { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px){
  .kpis { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce){
  .orbit-1, .orbit-2, .chip-a, .chip-b, .chip-c, .chip-d, .scroll-cue .wheel { animation: none !important; }
  .avatar-wrap { transform: none !important; }
}
</style>
