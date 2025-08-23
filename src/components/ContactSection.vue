<template>
  <section id="contatti" class="section" aria-labelledby="contact-title">
    <div class="container">
      <header class="section-head">
        <h2 id="contact-title">Hai un progetto in mente?</h2>
        <p>Scrivimi due righe: risponderò con una proposta chiara e tempi definiti.</p>
      </header>
      <form class="contact-form" @submit.prevent="onSubmit" novalidate>
        <div class="form-grid">
          <label><span>Nome</span><input type="text" v-model.trim="form.name" required autocomplete="name" /></label>
          <label><span>Email</span><input type="email" v-model.trim="form.email" required autocomplete="email" /></label>
          <label class="full"><span>Messaggio</span><textarea rows="5" v-model.trim="form.message" required></textarea></label>
          <input type="text" v-model="form.website" class="hp" tabindex="-1" autocomplete="off" />
        </div>
        <button class="btn primary" type="submit">Invia richiesta</button>
        <p class="form-note">Oppure scrivimi a <a href="mailto:maicol.ktc@gmail.com">maicol.ktc@gmail.com</a></p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({ name: '', email: '', message: '', website: '' })

const onSubmit = () => {
  if (form.value.website) return // honeypot
  if (!form.value.name || !form.value.email || !form.value.message) {
    alert('Per favore, compila tutti i campi obbligatori.')
    return
  }
  alert('Grazie! Ti risponderò a breve.')
  form.value = { name: '', email: '', message: '', website: '' }
}
</script>
