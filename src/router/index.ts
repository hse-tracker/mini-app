import { createRouter, createWebHistory } from 'vue-router'
import registrationView from '@/views/registration-view.vue'
import dashboardView from '@/views/dashboard-view.vue'
import { useAuth } from '@/composables/use-auth.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'Dashboard' }
    },
    {
      path: '/registration',
      name: 'Registration',
      component: registrationView,
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: dashboardView,
      meta: { requiresAuth: true }
    }
  ],
});

router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth();
  const isAuth = isAuthenticated();

  // if route requires auth and user is not loged in => redirect to registration
  if (to.meta.requiresAuth && !isAuth) {
    return next({ name: 'Registration' });
  }

  // if route is for guests and user is logged in => redirect to dashboard
  if (to.meta.requiresGuest && isAuth) {
    return next({ name: 'Dashboard' })
  }

  // else (everything is ok)
  next();
});

export default router
