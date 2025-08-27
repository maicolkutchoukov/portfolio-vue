<template>
  <div class="spotlight" ref="spot" aria-hidden="true">
    <div class="spotlight__streak"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
const spot = ref(null)

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let x = innerWidth / 2, y = innerHeight / 2
  let tx = x, ty = y, px = x, py = y
  const speed = 0.22
  let lastMoveTs = performance.now()

  const onMove = (e) => {
    tx = e.clientX; ty = e.clientY
    lastMoveTs = performance.now()
    if (spot.value) spot.value.classList.add('is-active') // mostra subito all’interazione
  }
  const onResize = () => {
    if (!Number.isFinite(tx)) { tx = innerWidth/2; ty = innerHeight/2 }
  }
  const onLeave = () => {
    // fade out elegante quando esce dal canvas/finestra
    if (spot.value) spot.value.classList.remove('is-active')
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('pointerleave', onLeave, { passive: true })

  let raf
  const loop = () => {
    if (!prefersReduced && spot.value) {
      // easing verso il target
      x += (tx - x) * speed; y += (ty - y) * speed

      const dx = x - px, dy = y - py
      const v = Math.hypot(dx, dy) // velocità istantanea
      // dentro loop(), dopo aver calcolato "v"
const glow = Math.min(1, 0.55 + v * 0.03) // bloom orb
spot.value.style.filter = `blur(4px) saturate(${1 + v*0.06}) brightness(${glow + 0.5})`
// subito dopo aver settato --op
if (v > 8) {
  spot.value.style.setProperty('--mag', (parseFloat(getComputedStyle(spot.value).getPropertyValue('--mag')) * 1.02).toFixed(3))
}

      const ang = Math.atan2(dy, dx) * 180 / Math.PI

      // posiziona il "comet"
      spot.value.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      spot.value.style.setProperty('--ang', `${ang}deg`)

      // grandezza e luminanza in base alla velocità
      const mag = Math.max(0.85, Math.min(1.75, 0.9 + v * 0.12))
      spot.value.style.setProperty('--mag', mag.toFixed(3))

      // opacità scia dinamica (più veloce → più scia)
      const op = Math.max(0.18, Math.min(0.6, 0.2 + v * 0.03))
      spot.value.style.setProperty('--op', op.toFixed(2))

      // attenua lentamente se l’utente smette di muovere
      const idle = performance.now() - lastMoveTs
      if (idle > 1200) {
        spot.value.style.setProperty('--op', '0.00')
      }

      px = x; py = y
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('pointerleave', onLeave)
  })
})
</script>

<style scoped>
/* ===== Neo-Tech Spotlight (drop-in) ===================================== */
/* Colori: usa la palette globale se c’è, altrimenti fallback neon */
:root{
  --neo-cyan:  var(--primary, #00f5ff);
  --neo-violet:var(--accent,  #7c3aed);
  --neo-core:  color-mix(in oklab, var(--neo-cyan) 70%, white);
}

/* Layer a schermo intero; non blocca input né stacking della UI */
.spotlight{
  position: fixed; inset: 0;
  pointer-events: none; z-index: 0;
  contain: layout paint; will-change: transform, opacity, filter;
  /* alone ambientale molto leggero */
  background:
    radial-gradient(800px 400px at 20% 10%, color-mix(in oklab, var(--neo-violet), transparent 92%), transparent 60%),
    radial-gradient(700px 360px at 80% 90%, color-mix(in oklab, var(--neo-cyan),  transparent 92%), transparent 60%);
}

/* — Orb: puntino con bloom + aberrazione cromatica (pseudo-elementi) — */
.spotlight::before,
.spotlight::after{
  content:""; position:absolute; left:50%; top:50%;
  width: 18px; height: 18px; border-radius: 50%;
  transform: translate(-50%, -50%) scale(var(--mag,1));
  opacity: .0; transition: opacity .25s ease, transform .15s ease;
  filter: blur(.3px) saturate(120%);
  will-change: transform, opacity, filter;
}
/* core luminoso */
.spotlight::before{
  background:
    radial-gradient(closest-side, var(--neo-core), transparent 70%),
    radial-gradient(closest-side, color-mix(in oklab, var(--neo-violet), transparent 20%), transparent 80%);
  box-shadow:
    0 0 14px color-mix(in oklab, var(--neo-cyan), transparent 30%),
    0 0 36px color-mix(in oklab, var(--neo-violet), transparent 45%);
}
/* lieve aberrazione cromatica (glint laterale) */
.spotlight::after{
  background:
    radial-gradient(closest-side, color-mix(in oklab, var(--neo-cyan), transparent 10%), transparent 70%);
  transform: translate(calc(-50% + 1px), calc(-50% + .6px)) scale(calc(var(--mag,1) * 1.02));
  mix-blend-mode: screen;
}
.spotlight.is-active::before,
.spotlight.is-active::after{ opacity: .95 }

/* — Scia: core + pattern tech + aloni — */
.spotlight__streak{
  position:absolute; left:0; top:0; pointer-events:none;
  transform:
    translate(-50%, -50%)
    rotate(var(--ang, 0deg))
    scaleX(calc(var(--mag,1) * 1.04))
    scaleY(calc(var(--mag,1) * 1.02));
  transform-origin: 10% 50%;
  width: 420px;               /* lunghezza scia */
  height: 28px;               /* spessore scia */
  opacity: var(--op, 0);      /* controllata dal JS */
  mix-blend-mode: screen;
  border-radius: 999px;
  will-change: transform, opacity, filter, background-position;

  /* Strati:
     1) core sfumato ciano→viola→ciano
     2) pattern “circuit” (linee sottili) che scorre
     3) alone diffuso */
  background:
    /* 1) core */
    linear-gradient(90deg,
      transparent 0%,
      color-mix(in oklab, var(--neo-cyan), transparent 15%) 14%,
      color-mix(in oklab, var(--neo-violet), transparent 15%) 52%,
      color-mix(in oklab, var(--neo-cyan), transparent 15%) 86%,
      transparent 100%),
    /* 2) pattern tech */
    repeating-linear-gradient(90deg,
      color-mix(in oklab, var(--neo-cyan), transparent 82%) 0 2px,
      transparent 2px 7px
    ),
    /* 3) alone */
    radial-gradient(120% 90% at 12% 50%,
      color-mix(in oklab, var(--neo-cyan), transparent 92%) 0%,
      transparent 60%);
  background-size:
    100% 100%,
    220% 100%,       /* si anima orizzontalmente */
    100% 100%;
  background-position:
    0 0,
    0 0,
    0 0;

  filter:
    blur(1.15px)
    drop-shadow(0 0 12px color-mix(in oklab, var(--neo-cyan), transparent 48%))
    drop-shadow(0 0 22px color-mix(in oklab, var(--neo-violet), transparent 58%));
  animation: streakFlow 1.8s linear infinite paused; /* si sblocca quando attivo */
}
.spotlight.is-active .spotlight__streak{ animation-play-state: running }

/* alone violaceo morbido aggiuntivo */
.spotlight__streak::after{
  content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background: radial-gradient(110% 70% at 35% 50%,
    color-mix(in oklab, var(--neo-violet), transparent 92%), transparent 65%);
  filter: blur(12px); opacity: .8;
}

/* movimento del pattern tech */
@keyframes streakFlow{
  0%   { background-position: 0 0,   0    0, 0 0 }
  100% { background-position: 0 0, -220% 0, 0 0 }
}

/* Riduci movimento: orb tenue, niente scia */
@media (prefers-reduced-motion: reduce){
  .spotlight__streak{ display:none !important }
  .spotlight::before,
  .spotlight::after{ opacity:.22 !important; transform: translate(-50%, -50%) scale(.9) !important }
}
</style>
