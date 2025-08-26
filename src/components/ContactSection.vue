<template>
  <section id="contatti" class="section contact" aria-labelledby="contact-title">
    <div class="container">
      <header class="section-head contact__head reveal">
        <h2 id="contact-title">Hai un progetto in mente?</h2>
        <p>Scrivimi due righe: risponderò con una proposta chiara e tempi definiti.</p>
      </header>

      <form class="contact__form reveal" @submit.prevent="onSubmit" novalidate aria-describedby="contact-status">
        <!-- Progress neon -->
        <div class="contact__progress" v-show="loading" aria-hidden="true"></div>

        <!-- Glow / holo frame -->
        <span class="contact__holo" aria-hidden="true"></span>

        <!-- Success burst -->
        <div class="burst" v-if="done" aria-hidden="true">
          <span v-for="p in particles" :key="p.id" class="particle"
                :style="{ '--x': p.x+'px', '--y': p.y+'px', '--rz': p.r+'deg', '--d': p.d+'ms' }"></span>
          <svg class="tick" viewBox="0 0 52 52">
            <path class="tick__path" d="M14 27 L23 36 L38 18" />
          </svg>
        </div>

        <div class="contact__grid">
          <!-- Nome -->
          <label class="fld">
            <span class="fld__label">Nome</span>
            <input
              class="fld__control"
              type="text"
              v-model.trim="form.name"
              required
              autocomplete="name"
              :aria-invalid="!!errors.name"
              :aria-describedby="errors.name ? 'err-name' : null"
            />
            <span v-if="errors.name" class="fld__error" id="err-name">{{ errors.name }}</span>
          </label>

          <!-- Email -->
          <label class="fld">
            <span class="fld__label">Email</span>
            <input
              class="fld__control"
              type="email"
              v-model.trim="form.email"
              required
              autocomplete="email"
              :aria-invalid="!!errors.email"
              :aria-describedby="errors.email ? 'err-email' : null"
            />
            <span v-if="errors.email" class="fld__error" id="err-email">{{ errors.email }}</span>
          </label>

          <!-- Messaggio -->
          <label class="fld fld--full">
            <span class="fld__label">Messaggio</span>
            <textarea
              class="fld__control"
              rows="5"
              v-model.trim="form.message"
              required
              :aria-invalid="!!errors.message"
              :aria-describedby="errors.message ? 'err-message' : null"
            ></textarea>
            <span v-if="errors.message" class="fld__error" id="err-message">{{ errors.message }}</span>
          </label>

          <!-- Honeypot -->
          <input
            class="hp"
            type="text"
            v-model="form.website"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />
        </div>

        <div class="contact__actions">
          <button
            class="btn primary contact__btn"
            type="submit"
            :disabled="loading"
            :class="{ 'is-loading': loading, 'is-done': done }"
          >
            <span class="btn__content" aria-hidden="true">
              <span class="btn__plane" v-if="loading"></span>
              <span class="btn__label" v-if="!loading && !done">Invia richiesta</span>
              <span class="btn__label" v-else-if="loading">Invio…</span>
              <span class="btn__label" v-else>Inviato</span>
            </span>
            <span class="sr-only">
              <template v-if="loading">Invio in corso…</template>
              <template v-else-if="done">Messaggio inviato correttamente.</template>
              <template v-else>Pronto all'invio.</template>
            </span>
          </button>

          <p class="form-note">
            Oppure scrivimi a
            <a href="mailto:maicol.ktc@gmail.com">maicol.ktc@gmail.com</a>
          </p>
        </div>

        <!-- Stato accessibile -->
        <p id="contact-status" class="sr-only" aria-live="polite">
          <template v-if="loading">Invio in corso…</template>
          <template v-else-if="done">Messaggio inviato correttamente.</template>
          <template v-else-if="error">{{ error }}</template>
        </p>

        <!-- Alert visivo -->
        <div v-if="done" class="contact__toast contact__toast--ok" role="status" aria-live="polite">
          <span class="ico" aria-hidden="true">✓</span>
          Grazie! Ti risponderò a breve.
        </div>
        <div v-if="error" class="contact__toast contact__toast--err" role="alert" aria-live="assertive">
          <span class="ico" aria-hidden="true">!</span>
          {{ error }}
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({ name: '', email: '', message: '', website: '' })
const errors = ref({ name: '', email: '', message: '' })
const loading = ref(false)
const done = ref(false)
const error = ref('')

// particelle per l'esplosione di successo
const particles = ref([])

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  errors.value = { name: '', email: '', message: '' }
  let ok = true
  if (!form.value.name) { errors.value.name = 'Inserisci il tuo nome.'; ok = false }
  if (!form.value.email) { errors.value.email = 'Inserisci un’email valida.'; ok = false }
  else if (!emailRe.test(form.value.email)) { errors.value.email = 'Formato email non valido.'; ok = false }
  if (!form.value.message) { errors.value.message = 'Scrivi un breve messaggio.'; ok = false }
  return ok
}

function makeParticles(n = 26) {
  // genera una rosa di particelle attorno al bottone
  particles.value = Array.from({ length: n }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 360, // offset x
    y: (Math.random() - 0.5) * 240, // offset y
    r: Math.floor(Math.random() * 360), // rotazione
    d: 400 + Math.floor(Math.random() * 500) // durata
  }))
}

async function onSubmit() {
  error.value = ''
  done.value = false
  if (form.value.website) return // honeypot
  if (!validate()) return

  loading.value = true
  try {
    const res = await fetch('/.netlify/functions/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data?.ok === false) {
      throw new Error(data?.error || 'Invio non riuscito, riprova tra poco.')
    }
    done.value = true
    makeParticles()
    // reset form con piccolo delay per lasciare godere l'animazione
    setTimeout(() => {
      form.value = { name: '', email: '', message: '', website: '' }
    }, 300)
  } catch (e) {
    error.value = e?.message || 'Errore imprevisto.'
  } finally {
    // lascia correre l’animazione di volo prima di spegnere lo stato loading
    setTimeout(() => { loading.value = false }, 300)
  }
}
</script>

<style scoped>
/* =========================================================
   CONTACT — Futuristic Neon Animations + Accessibilità
   ========================================================= */

:root {
  /* Neon brand (coerenti con la tua palette) */
  --neon-cyan: #00f5ff;
  --neon-violet: #7c3aed;
}

/* Aura di sfondo leggerissima per la section */
.contact { position: relative; }
.contact::before {
  content: "";
  position: absolute; inset: 0;
  background:
    radial-gradient(600px 320px at 85% 10%, color-mix(in oklab, var(--neon-violet), transparent 90%), transparent 60%),
    radial-gradient(520px 300px at 15% 90%, color-mix(in oklab, var(--neon-cyan), transparent 90%), transparent 60%);
  pointer-events: none; z-index: 0;
  filter: saturate(120%);
}

/* Testata */
.contact__head p { color: var(--muted) }

/* Card form */
.contact__form{
  position: relative;
  margin-top: 16px;
  padding: 20px;
  border-radius: var(--radius);
  border: 1px solid var(--stroke);
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--card), transparent 5%), transparent),
    radial-gradient(120% 80% at 10% -10%, color-mix(in oklab, var(--neon-violet), transparent 90%), transparent 70%),
    radial-gradient(120% 80% at 100% 110%, color-mix(in oklab, var(--neon-cyan), transparent 92%), transparent 70%);
  box-shadow: var(--shadow);
  z-index: 1;
  overflow: clip;
}

/* Progress bar superiore (solo quando loading) */
.contact__progress{
  position:absolute; top:0; left:0; height:3px; width:100%;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-violet));
  transform-origin: 0 50%;
  animation: prog 1.2s ease-in-out infinite;
}
@keyframes prog {
  0% { transform: scaleX(0); opacity:.8 }
  50% { transform: scaleX(.6); opacity:1 }
  100% { transform: scaleX(1); opacity:.8 }
}

/* Holo ring animato sul bordo (conic gradient) */
.contact__holo{
  position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background:
    conic-gradient(from 0deg,
      transparent 0 24%,
      color-mix(in oklab, var(--neon-cyan), transparent 40%) 24% 38%,
      transparent 38% 62%,
      color-mix(in oklab, var(--neon-violet), transparent 40%) 62% 76%,
      transparent 76% 100%);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor; mask-composite:exclude;
  padding: 1px;
  opacity:.0; transition: opacity .5s ease;
}
.contact__form:hover .contact__holo{ opacity: .9 }

/* Griglia campi */
.contact__grid{
  display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px;
}
.contact__actions{
  display:flex; align-items:center; gap: 12px; margin-top: 14px; flex-wrap: wrap;
}
@media (max-width: 720px){
  .contact__grid{ grid-template-columns: 1fr }
}

/* Field */
.fld{ display:flex; flex-direction:column; gap:6px }
.fld--full{ grid-column: 1/-1 }
.fld__label{ font-weight:800; font-size:.95rem }
.fld__control{
  width:100%;
  padding: 11px 12px;
  border: 1px solid var(--stroke);
  border-radius: 12px;
  background: color-mix(in oklab, var(--bg), #0b1220 40%);
  color: var(--text);
  transition: outline-color var(--t-fast) ease, border-color var(--t-fast) ease, box-shadow var(--t-fast) ease, transform .2s ease;
  box-shadow: inset 0 0 0 0 rgba(122,162,255,0);
}
.fld__control:focus{
  outline: 2px solid color-mix(in oklab, var(--neon-cyan), transparent 45%);
  border-color: transparent;
  box-shadow: 0 0 0 6px color-mix(in oklab, var(--neon-cyan), transparent 85%);
}
.fld__control[aria-invalid="true"]{
  border-color: color-mix(in oklab, #ff6b6b 70%, var(--stroke));
  box-shadow: 0 0 0 4px rgba(255,107,107,.14);
}
.fld__error{ color:#ffb3b3; font-size:.9rem }

/* Bottone + micro-animazioni */
.contact__btn{
  min-width: 200px; position: relative; overflow:hidden;
  border: 1px solid color-mix(in oklab, var(--neon-cyan), var(--neon-violet) 40%);
}
.contact__btn::after{
  content:""; position:absolute; inset:0; pointer-events:none; opacity:.0;
  background: radial-gradient(120px 60px at var(--x,50%) var(--y,50%), color-mix(in oklab, var(--neon-cyan), transparent 75%), transparent 60%);
  transition: opacity .25s ease;
}
.contact__btn:hover::after{ opacity:.8 }
.contact__btn.is-loading{ cursor: progress }
.contact__btn.is-done{
  background: linear-gradient(90deg, color-mix(in oklab, var(--neon-cyan), transparent 20%), color-mix(in oklab, var(--neon-violet), transparent 20%));
  animation: btnPulse 1.6s ease-out 1;
}
@keyframes btnPulse {
  0% { box-shadow: 0 0 0 0 color-mix(in oklab, var(--neon-cyan), transparent 60%) }
  100% { box-shadow: 0 0 0 18px transparent }
}

/* Icona aereo (loading) */
.btn__plane{
  width: 16px; height: 16px; display:inline-block; margin-right:8px; background: currentColor; clip-path: polygon(0 45%, 70% 45%, 70% 30%, 100% 50%, 70% 70%, 70% 55%, 0 55%);
  animation: plane 900ms ease-in-out infinite;
  vertical-align: -2px;
}
@keyframes plane {
  0% { transform: translateX(0) translateY(0) rotate(0) }
  50% { transform: translateX(6px) translateY(-2px) rotate(5deg) }
  100% { transform: translateX(0) translateY(0) rotate(0) }
}

/* Toast (success / error) */
.contact__toast{
  margin-top: 12px;
  display:inline-flex; align-items:center; gap:10px;
  padding: 10px 12px; border-radius: 12px; font-weight: 700;
  border: 1px solid var(--stroke); background: rgba(0,0,0,.15);
  animation: toastIn .36s cubic-bezier(.2,.8,.2,1);
}
.contact__toast .ico{
  display:inline-grid; place-items:center; width: 20px; height: 20px; border-radius:50%;
  font-size: 12px; font-weight: 1000;
}
.contact__toast--ok .ico{ background: color-mix(in oklab, var(--neon-cyan), transparent 75%) }
.contact__toast--err .ico{ background: rgba(255,107,107,.25) }
@keyframes toastIn{
  from{ opacity:0; transform: translateY(6px) scale(.98) }
  to  { opacity:1; transform: none }
}

/* Success burst */
.burst{
  position:absolute; inset:0; pointer-events:none; z-index: 2;
  display:grid; place-items:center;
}
.particle{
  position:absolute; top: calc(100% - 56px); left: 50%;
  width: 8px; height: 8px; border-radius: 2px;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-violet));
  transform: translate(calc(var(--x)), calc(var(--y))) rotate(var(--rz));
  animation: pop var(--d) cubic-bezier(.2,.8,.2,1) forwards;
  filter: drop-shadow(0 0 6px color-mix(in oklab, var(--neon-cyan), transparent 40%));
}
@keyframes pop{
  0% { opacity: 0; transform: translate(0,0) scale(.5) rotate(0) }
  15%{ opacity: 1 }
  100%{ opacity: 0; transform: translate(var(--x), var(--y)) scale(1.2) rotate(var(--rz)) }
}
/* Tick animato */
.tick{ width: 74px; height: 74px; }
.tick__path{
  fill: none; stroke: var(--neon-cyan); stroke-width: 6; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 60; stroke-dashoffset: 60; animation: draw .6s .15s ease forwards;
  filter: drop-shadow(0 0 12px color-mix(in oklab, var(--neon-cyan), transparent 50%));
}
@keyframes draw { to { stroke-dashoffset: 0 } }

/* Honeypot (nascosto) */
.hp{ position:absolute; left:-9999px; width:1px; height:1px; opacity:0 }

/* Reveal (aggancia l’IO globale già presente) */
.reveal{ opacity:0; transform: translateY(16px); transition: opacity .6s ease, transform .6s ease }
.reveal.reveal-in{ opacity:1; transform:none }

/* Riduci movimento per accessibilità */
@media (prefers-reduced-motion: reduce) {
  .contact__progress, .contact__holo, .particle, .tick__path, .btn__plane { animation: none !important }
}
</style>
