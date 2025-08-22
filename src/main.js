import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

const Home = () => import('./views/HomeView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', name: 'home', component: Home }],
  scrollBehavior() { return { top: 0 } }
})

createApp(App).use(router).mount('#app')
