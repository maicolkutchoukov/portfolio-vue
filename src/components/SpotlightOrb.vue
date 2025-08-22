<template>
  <div class="spotlight" ref="spot">
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

  const onMove = (e) => { tx = e.clientX; ty = e.clientY }
  const onResize = () => { if (!Number.isFinite(tx)) { tx = innerWidth/2; ty = innerHeight/2 } }
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })

  let raf
  const loop = () => {
    if (!prefersReduced && spot.value) {
      x += (tx - x) * speed; y += (ty - y) * speed
      const dx = x - px, dy = y - py
      const v = Math.hypot(dx, dy)
      const ang = Math.atan2(dy, dx) * 180 / Math.PI
      spot.value.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      const mag = Math.max(0.8, Math.min(1.6, 0.8 + v * 0.10))
      spot.value.style.setProperty('--ang', `${ang}deg`)
      spot.value.style.setProperty('--mag', mag.toFixed(3))
      const op = Math.max(0.18, Math.min(0.38, 0.18 + v * 0.02))
      const streak = spot.value.querySelector('.spotlight__streak')
      if (streak) streak.style.opacity = op.toFixed(2)
      px = x; py = y
    }
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('resize', onResize)
  })
})
</script>
