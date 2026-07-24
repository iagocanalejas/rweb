import ByClubView from '@/views/ByClubView.vue'
import ByLeagueView from '@/views/ByLeagueView.vue'
import { createRouter, createWebHistory } from 'vue-router'

export enum RouteName {
  ByLeague = 'by-league',
  LeagueYearSpeeds = 'league-year-speeds',
  LeagueNthSpeeds = 'nth-speeds',
  ByClub = 'by-club',
  ClubYearSpeeds = 'club-year-speeds',
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: RouteName.ByLeague } },
    {
      path: '/by-league',
      name: RouteName.ByLeague,
      redirect: { name: RouteName.LeagueYearSpeeds },
      component: ByLeagueView,
      beforeEnter: async () => {
        const { useLeaguesStore } = await import('@/stores/leagues')
        await useLeaguesStore().fetchLeagues()
      },
      children: [
        {
          path: RouteName.LeagueYearSpeeds,
          name: RouteName.LeagueYearSpeeds,
          component: () => import('@/views/charts/AVGYearSpeedsByLeagueView.vue'),
        },
        {
          path: RouteName.LeagueNthSpeeds,
          name: RouteName.LeagueNthSpeeds,
          component: () => import('@/views/charts/NthSpeedView.vue'),
        },
      ],
    },
    {
      path: '/by-club',
      name: RouteName.ByClub,
      component: ByClubView,
      redirect: { name: RouteName.ClubYearSpeeds },
      children: [
        {
          path: RouteName.ClubYearSpeeds,
          name: RouteName.ClubYearSpeeds,
          component: () => import('@/views/charts/AVGYearSpeedsByClubView.vue'),
        },
      ],
    },
  ],
})

export default router
