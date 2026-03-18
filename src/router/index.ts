import { createRouter, createWebHistory } from 'vue-router'
import registrationView from '@/views/registration-view.vue'
import dashboardView from '@/views/dashboard-view.vue'
import { useAuth } from '@/composables/use-auth.ts'
import subjectView from '@/views/subject-view.vue'
import addSubjectView from '@/views/add-subject-view.vue'
import tutorialView from '@/views/tutorial-view.vue'

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
    },
    {
      path: '/subject/:id',
      name: 'Subject',
      component: subjectView,
      meta: { requiresAuth: true }
    },
    {
      path: '/addsubject',
      name: 'AddSubject',
      component: addSubjectView,
      meta: { requiresAuth: true }
    },
    {
      path: '/tutorial',
      name: 'Tutorial',
      component: tutorialView,
      meta: { requiresAuth: true }
    },
  ],
});

router.beforeEach((to, from, next) => {
  const { isAuthenticated, getToken } = useAuth();
  const isAuth = isAuthenticated();

  if (isAuthenticated() && to.name) {
    const token = getToken();

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/logs/navigation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ tab_name: String(to.name) })
    }).catch(err => {
      console.warn("Failed to log navigation:", err);
    });
  }

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
