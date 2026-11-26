<script setup>
import { RouterView, useRoute } from 'vue-router';
const rota = useRoute();
const secoes = [
  { titulo: 'Consultas', destino: '/consultas', icone: 'mdi-calendar-clock' },
  { titulo: 'Pacientes', destino: '/pacientes', icone: 'mdi-account-group' },
];
</script>

<template>
  <v-app>
    <v-navigation-drawer permanent color="surface" width="250">
      <div class="marca">Teste Horizon</div>
      <v-divider />
      <v-list nav density="comfortable">
        <v-list-item
          v-for="secao in secoes"
          :key="secao.destino"
          :to="secao.destino"
          :active="rota.path === secao.destino"
          :prepend-icon="secao.icone"
          :title="secao.titulo"
          rounded="lg"
          color="primary"
        />
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container class="conteudo" fluid>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.marca { padding: 25px 20px; font-size: 20px; font-weight: 700; color: #000; }
.conteudo { max-width: 1200px; }
</style>
