<template>
  <div>
    <SiteHeader :theme="theme" @toggle-theme="toggleTheme" />
    <router-view />
    <!-- <SiteFooter :theme="theme" /> -->
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, onBeforeUnmount } from "vue";
// Usa il path RELATIVO se non hai l'alias "@"
import SiteHeader from "./components/SiteHeader.vue";
// import SiteFooter from "./components/SiteFooter.vue";

const theme = ref(localStorage.getItem("theme") ?? "dark");
const toggleTheme = () => {
  theme.value = theme.value === "dark" ? "light" : "dark";
};
watchEffect(() => {
  document.documentElement.setAttribute("data-theme", theme.value);
  localStorage.setItem("theme", theme.value);
});

let onMove, onScroll, io;

onMounted(() => {
  const root = document.documentElement;

  // Mouse glow
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

  // Reveal-in
  io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) =>
        en.target.classList.toggle("reveal-in", en.isIntersecting)
      ),
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
