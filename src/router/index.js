import { createRouter, createWebHistory } from 'vue-router'
import StartView from '../views/StartView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Start',
      component: StartView
    },
    {
      path: '/about/',
      name: 'About',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/join/',
      name: 'PlayerLobby',
      component: () => import('../views/JoinGameView.vue')
    },
    {
      path: '/create/',
      name: 'CreateView',
      component: () => import('../views/CreateView.vue')
    },
    {
      path: '/lobby/:id/:userID',
      name: 'WaitingRoom',
      component: () => import('../views/WaitingRoom.vue')
    },
    {
      path: '/game/:id/:userID',
      name: 'Game',
      component: () => import('../views/GameView.vue')
    },
  ]
})

export default router
