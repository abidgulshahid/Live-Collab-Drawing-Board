import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/LoginForm.vue'
import Signup from '../components/SignupFrom.vue'
import Home from '@/components/Home.vue'
import Profile from '@/components/Profile.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
  },
  {
    path: '/',
    redirect: '/login',  // Redirect to login as default
  },
  {
    path: '/homepage',
    name: 'Homepage',
    component: Home,
    meta: {reload:true, requiresAuth: true}

  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: {reload:true, requiresAuth: true}

  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('access_token') // Check if user is authenticated
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    // If the route requires auth and the user is not authenticated, redirect to login
    next({ name: 'Login' })
  } else {
    // Otherwise, allow access
    next()
  }
})

export default router