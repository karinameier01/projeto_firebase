import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: () => import('@/views/LoginPage.vue') },
  { path: '/register', component: () => import('@/views/RegisterPage.vue') },
  { path: '/forgot-password', component: () => import('@/views/ForgetPasswordPage.vue') },
  { path: '/home', component: () => import('@/views/HomePage.vue'), meta: { requiresAuth: true } },
  { path: '/profile', component: () => import('@/views/ProfilePage.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Espera o Firebase informar quem está logado (ou null)
function usuarioAtual(): Promise<User | null> {
  return new Promise((resolve) => {
    const cancelar = onAuthStateChanged(auth, (user) => {
      cancelar()
      resolve(user)
    })
  })
}

router.beforeEach(async (to) => {
  const user = await usuarioAtual()
  if (to.meta.requiresAuth && !user) return '/login'
  if (user && ['/login', '/register', '/forgot-password'].includes(to.path)) return '/home'
})

export default router