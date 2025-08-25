<template>
  <div>
    <SiteHeader :theme="theme" @toggle-theme="toggleTheme" />
    <router-view />
    <!-- <SiteFooter :theme="theme" /> -->
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import SiteHeader from "./components/SiteHeader.vue";
// import SiteFooter from "./components/SiteFooter.vue";

const theme = ref(localStorage.getItem("theme") ?? "dark");
const toggleTheme = () => { theme.value = theme.value === "dark" ? "light" : "dark"; };
watchEffect(() => {
  document.documentElement.setAttribute("data-theme", theme.value);
  localStorage.setItem("theme", theme.value);
});

let onMove, onScroll, io, mo; // mouse, scroll, intersectionObserver, mutationObserver
const router = useRouter();

function observeReveals(rootEl = document) {
  if (!io) return;
  rootEl.querySelectorAll?.(".reveal")?.forEach((el) => io.observe(el));
}

onMounted(async () => {
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

  // IntersectionObserver per .reveal
  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        en.target.classList.toggle("reveal-in", en.isIntersecting);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  // 1) Osserva ciò che esiste ORA (dopo che i child hanno montato)
  await nextTick();
  observeReveals(document);

  // 2) Osserva nuovi nodi che entrano in DOM (es. routing, component async)
  mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes?.forEach?.((node) => {
        if (!(node instanceof Element)) return;
        // Se il nodo stesso è .reveal, o contiene dei .reveal, osserva
        if (node.matches?.(".reveal")) io.observe(node);
        const inner = node.querySelectorAll?.(".reveal");
        if (inner?.length) inner.forEach((el) => io.observe(el));
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // 3) Re-scan dopo ogni navigazione
  router.afterEach(async () => {
    await nextTick();
    observeReveals(document);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", onMove);
  window.removeEventListener("scroll", onScroll);
  io?.disconnect();
  mo?.disconnect();
});
</script>
