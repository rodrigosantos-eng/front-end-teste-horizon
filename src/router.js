import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/consultas' },
    { path: '/consultas', name: 'consultas', component: () => import('./views/PaginaConsultas.vue'), meta: { title: 'Consultas' } },
    { path: '/pacientes', name: 'pacientes', component: () => import('./views/PaginaPacientes.vue'), meta: { title: 'Pacientes' } },
    { path: '/:pathMatch(.*)*', redirect: '/consultas' },
  ],
});

export default router;
