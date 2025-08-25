<template>
  <div>
    <SiteHeader :theme="theme" @toggle-theme="toggleTheme" />
    <router-view />
    <!-- <SiteFooter :theme="theme" /> se serve -->
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";

let onMove, onScroll, io;

onMounted(() => {
  const root = document.documentElement;

  // Mouse glow (aggiorna --x/--y con rAF)
  let raf = 0;
  onMove = (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      root.style.setProperty("--x", e.clientX + "px");
      root.style.setProperty("--y", e.clientY + "px");
      raf = 0;
    });
  };
  window.addEventListener("mousemove", onMove, { passive: true });

  // Header shadow on scroll
  const header = document.querySelector(".site-header");
  onScroll = () => header?.classList.toggle("shadow", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal-in con IntersectionObserver
  io = new IntersectionObserver(
    (entries) => entries.forEach((en) => en.target.classList.toggle("reveal-in", en.isIntersecting)),
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", onMove);
  window.removeEventListener("scroll", onScroll);
  io?.disconnect();
});
</script>

