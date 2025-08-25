<template>
  <section id="about" class="section alt about" aria-labelledby="about-title">
    <div class="container about__wrap">
      <!-- COPY -->
      <div class="about__copy reveal">
        <p class="about__eyebrow">Chi sono</p>
        <h2 id="about-title" class="about__title">
          Costruisco interfacce <span class="accent">veloci</span>, 
          <span class="accent">accessibili</span> e <span class="accent">scalabili</span>.
        </h2>

        <p class="about__lead">
          Sono <strong>{{ site.author }}</strong>, Web Developer <em>PHP / Frontend</em>.
          Aiuto team e aziende a spedire prodotti solidi, misurabili e curati nel dettaglio:
          dalla <abbr title="User Experience">UX</abbr> alla performance, passando per <abbr title="Search Engine Optimization">SEO</abbr> tecnica e componenti riutilizzabili.
        </p>

        <ul class="about__checks">
          <li>Codice pulito e testabile (SRP, dependency boundaries)</li>
          <li>Design system, naming coerente e token semantici</li>
          <li>Core Web Vitals &amp; tracciamenti affidabili (A/B, data layer)</li>
        </ul>

        <div class="cta about__cta">
          <a class="btn secondary" href="#contatti">Parliamo del tuo progetto</a>
          <a class="btn ghost" href="#portfolio">Vedi i progetti</a>
        </div>

        <!-- KPI -->
        <div class="about__kpi reveal" aria-label="Metriche sintetiche">
          <article class="kpi-card">
            <span class="kpi-card__num" data-target="2" data-suffix="+">0</span>
            <span class="kpi-card__label">anni esperienza</span>
          </article>
          <article class="kpi-card">
            <span class="kpi-card__num" data-target="30" data-suffix="+">0</span>
            <span class="kpi-card__label">progetti lanciati</span>
          </article>
          <article class="kpi-card">
            <span class="kpi-card__num" data-target="1" data-suffix="s">&lt; 0</span>
            <span class="kpi-card__label">LCP tipico</span>
          </article>
        </div>
      </div>

      <!-- MEDIA / ID CARD -->
      <aside class="about__media reveal" aria-hidden="true">
        <div class="idcard" ref="idCard">
          <div class="idcard__bg"></div>
          <div class="idcard__ring"></div>
          <div class="idcard__scan"></div>
          <figure class="idcard__frame">
            <img :src="avatarUrl" alt="" decoding="async" loading="lazy" />
          </figure>
          <div class="idcard__meta">
            <div class="idcard__meta-row">
              <span class="dot"></span>
              <span>Web Developer</span>
              <span class="sep">•</span>
              <span>PHP</span><span class="sep">/</span><span>Frontend</span>
            </div>
            <div class="idcard__meta-row muted">
              <span>Perf • UX • SEO</span>
            </div>
          </div>
          <div class="idcard__glow"></div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import site from '../site.config.js'
import avatarUrl from '@/assets/img/avatar.jpg'

const idCard = ref(null)
let onMove

// Interazioni leggere: parallax 3D SOLO su pointer device
onMounted(() => {
  const el = idCard.value
  if (!el) return
  const supportHover = window.matchMedia('(hover:hover)').matches

  if (supportHover) {
    let raf = 0
    onMove = (e) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const cx = e.clientX - r.left
        const cy = e.clientY - r.top
        const nx = (cx / r.width) - 0.5
        const ny = (cy / r.height) - 0.5
        el.style.setProperty('--rx', (ny * -6).toFixed(2) + 'deg')
        el.style.setProperty('--ry', (nx * 6).toFixed(2) + 'deg')
        el.style.setProperty('--mx', (cx / r.width * 100).toFixed(2) + '%')
        el.style.setProperty('--my', (cy / r.height * 100).toFixed(2) + '%')
        raf = 0
      })
    }
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    }, { passive: true })
  }

  // KPI count-up una sola volta quando visibili
  const nums = Array.from(document.querySelectorAll('.kpi-card__num'))
  const seen = new WeakSet()
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return
      const elNum = en.target
      if (seen.has(elNum)) return
      seen.add(elNum)
      const target = Number(elNum.getAttribute('data-target')) || 0
      const suffix = elNum.getAttribute('data-suffix') || ''
      const start = performance.now()
      const dur = 900
      const ease = t => 1 - Math.pow(1 - t, 3)
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur)
        const v = Math.floor(target * ease(p))
        elNum.textContent = (target === 1 && suffix === 's' && v === 0) ? '< 1' + suffix : v + suffix
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      // piccolo glow
      elNum.animate([{ textShadow:'0 0 0 rgba(122,162,255,0)' }, { textShadow:'0 0 18px rgba(122,162,255,.55)' }, { textShadow:'0 0 0 rgba(122,162,255,0)' }], { duration: 700, easing: 'ease-out' })
    })
  }, { threshold: 0.4 })
  nums.forEach(n => io.observe(n))
})

onBeforeUnmount(() => {
  const el = idCard.value
  if (el && onMove) el.removeEventListener('pointermove', onMove)
})
</script>

<style scoped>
/* ================= Base layout ================= */
.about__wrap{
  display:grid;
  grid-template-columns: 1.1fr .9fr;
  gap:32px;
  align-items:center;
}
@media (max-width: 1024px){
  .about__wrap{ grid-template-columns: 1fr; gap: 24px }
}

/* ================= Copy ================= */
.about__eyebrow{
  font-size:12px; letter-spacing:.18em; text-transform:uppercase;
  color:var(--muted); margin:0 0 8px
}
.about__title{
  margin:0 0 10px; font-size: clamp(28px, 4.6vw, 40px); line-height:1.06
}
.about__lead{
  margin: 10px 0 16px;
  color: color-mix(in oklab, var(--text) 82%, var(--muted));
}
.about__checks{
  list-style:none; padding:0; margin: 10px 0 18px;
}
.about__checks li{
  position:relative; padding-left:26px; margin:8px 0; color: color-mix(in oklab, var(--text) 88%, var(--muted));
}
.about__checks li::before{
  content:''; position:absolute; left:0; top:8px; width:14px; height:14px; border-radius:50%;
  background: radial-gradient(closest-side, var(--primary), rgba(124,58,237,.8));
  box-shadow: 0 0 16px rgba(0,245,255,.28);
}
.about__cta{ margin-top: 8px }

/* ================= KPI ================= */
.about__kpi{
  display:grid; grid-template-columns: repeat(3, minmax(0,1fr));
  gap:12px; margin-top: 20px;
}
@media (max-width: 720px){
  .about__kpi{ grid-template-columns: repeat(2, minmax(0,1fr)) }
}
@media (max-width: 480px){
  .about__kpi{ grid-template-columns: 1fr }
}
.kpi-card{
  position:relative; padding:14px 16px; text-align:center; border-radius:16px;
  border:1px solid var(--stroke);
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--card), transparent 6%), transparent),
    radial-gradient(120% 80% at 10% -10%, rgba(124,58,237,.10), transparent 70%),
    radial-gradient(120% 80% at 100% 110%, rgba(0,245,255,.08), transparent 70%);
  box-shadow: 0 8px 24px rgba(0,0,0,.18);
  overflow: clip;
}
.kpi-card::after{
  content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background: conic-gradient(from 0deg, transparent 0 30%, rgba(0,245,255,.32), transparent 60% 100%);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor; mask-composite:exclude;
  opacity:0; transition: opacity .4s ease;
}
.kpi-card:hover::after{ opacity:1 }
.kpi-card__num{
  display:block; font-weight:1000; font-size: clamp(24px, 4.2vw, 34px); line-height:1;
}
.kpi-card__label{ display:block; margin-top:6px; color: var(--muted) }

/* ================= Media: ID card futuristica ================= */
.about__media{ position:relative }
.idcard{
  --rx: 0deg; --ry: 0deg; --mx: 50%; --my: 50%;
  position:relative; border-radius: 22px; overflow: hidden;
  border:1px solid var(--stroke);
  background: linear-gradient(180deg, color-mix(in oklab, var(--card), transparent 6%), transparent);
  box-shadow: var(--shadow);
  transform-style: preserve-3d;
  transition: transform .36s cubic-bezier(.2,.8,.2,1), box-shadow .36s ease, filter .36s ease;
  perspective: 900px;
  will-change: transform, filter;
}
@media (hover:hover){
  .idcard:hover{ transform: translateY(-4px) rotateX(var(--rx)) rotateY(var(--ry)) }
}
.idcard__bg{
  position:absolute; inset:-10%;
  background:
    radial-gradient(600px 340px at 70% 20%, rgba(109,140,255,.18), transparent),
    radial-gradient(520px 320px at 30% 80%, rgba(47,214,183,.16), transparent);
  filter: blur(10px) saturate(120%);
  animation: hueShift 18s linear infinite;
}
@keyframes hueShift{ 0%{ filter:hue-rotate(0deg) } 50%{ filter:hue-rotate(95deg) } 100%{ filter:hue-rotate(0deg) } }

.idcard__ring{
  position:absolute; left:50%; top:50%; width:220px; height:220px; transform: translate(-50%,-50%);
  border-radius:50%;
  background: conic-gradient(from 0deg, rgba(0,245,255,.0), rgba(0,245,255,.45), rgba(124,58,237,.45), rgba(0,245,255,.0));
  filter: blur(10px); opacity:.28; mix-blend-mode: screen; pointer-events:none;
  animation: ringSpin 9s linear infinite;
}
@keyframes ringSpin{ to { transform: translate(-50%,-50%) rotate(360deg) } }

.idcard__scan{
  position:absolute; inset:-35% -15% auto -15%; height:52%;
  background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,0));
  transform: translateY(-120%) rotate(10deg);
  filter: blur(6px); mix-blend-mode: screen; pointer-events:none;
  animation: scanPass 5.2s ease-in-out infinite;
}
@keyframes scanPass{ 0%,15%{ transform: translateY(-120%) rotate(10deg) } 45%{ transform: translateY(120%) rotate(10deg) } 100%{ transform: translateY(120%) rotate(10deg) } }

.idcard__frame{
  position:relative; margin:0; padding:0; border-bottom:1px solid var(--stroke); overflow:hidden;
}
.idcard__frame::before{
  content:''; position:absolute; inset:0;
  background:
    radial-gradient(220px 120px at var(--mx) var(--my), rgba(122,162,255,.18), transparent 60%),
    radial-gradient(220px 120px at calc(100% - var(--mx)) calc(100% - var(--my)), rgba(47,214,183,.12), transparent 60%);
  mix-blend-mode: screen; pointer-events:none;
}
.idcard__frame img{
  display:block; width:100%; height:auto; object-fit:cover; aspect-ratio: 4/3;
  transform: none; transition: none; image-rendering: auto; /* NO ZOOM */
}

.idcard__meta{
  position:relative; padding: 12px 14px;
}
.idcard__meta-row{
  display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-weight:700;
}
.idcard__meta-row .dot{
  width:8px; height:8px; border-radius:50%;
  background: radial-gradient(closest-side, var(--primary), rgba(124,58,237,.8));
  box-shadow: 0 0 12px rgba(0,245,255,.4);
}
.idcard__meta-row .sep{ opacity:.5 }

.idcard__glow{
  position:absolute; inset:0; pointer-events:none; border-radius: inherit;
  background: conic-gradient(from 0deg, transparent 0 30%, rgba(0,245,255,.28), transparent 60% 100%);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor; mask-composite:exclude;
  opacity:0; transition: opacity .4s ease;
}
.idcard:hover .idcard__glow{ opacity:1 }

/* Reveal helper già presente globalmente (.reveal/.reveal-in) */
.reveal{ opacity:0; transform: translateY(16px); transition: opacity .6s ease, transform .6s ease }
.reveal.reveal-in{ opacity:1; transform:none }
</style>
