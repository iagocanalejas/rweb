import HomeView from '@/views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: { name: 'year-speeds' },
      component: HomeView,
      beforeEnter: async () => {
        const { useLeaguesStore } = await import('@/stores/leagues')
        await useLeaguesStore().fetchLeagues()
      },
      children: [
        {
          path: 'year-speeds',
          name: 'year-speeds',
          component: () => import('@/views/charts/AVGYearSpeedsView.vue'),
        },
        {
          path: 'nth-speeds',
          name: 'nth-speeds',
          component: () => import('@/views/charts/NthSpeedView.vue'),
        },
      ],
    },
  ],
})

export default router
