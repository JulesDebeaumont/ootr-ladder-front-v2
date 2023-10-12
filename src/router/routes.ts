import { RouteRecordRaw } from 'vue-router';
import { guardIsConnected } from 'src/router/guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    redirect: 'schedule',
    children: [
      { 
        path: 'schedule',
        name: 'schedule',
        component: () => import('pages/SchedulePage.vue') 
      },
      { 
        path: 'leaderboard',
        name: 'leaderboard',
        component: () => import('pages/LeaderboardPage.vue') 
      },
      { 
        path: 'session',
        name: 'session',
        component: () => import('pages/SessionPage.vue') 
      },
      { 
        path: 'wiki',
        name: 'wiki',
        component: () => import('pages/WikiPage.vue') 
      },
      { 
        path: 'annoying-cucco',
        name: 'annoying-cucco',
        component: () => import('pages/CuccoPage.vue') 
      },
      {
        path: 'profile/:username',
        name: 'profile-by-username',
        beforeEnter: guardIsConnected,
        component: () => import('pages/ProfilePage.vue')
      },
      {
        path: 'my-profile',
        name: 'my-profile',
        beforeEnter: guardIsConnected,
        component: () => import('pages/ProfilePage.vue')
      }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    redirect: { name: 'schedule' }
  },
];

export default routes;
