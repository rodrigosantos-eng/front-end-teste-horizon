<script setup>
import { onMounted, ref } from 'vue';
import {
  atualizarPaciente,
  criarPaciente,
  excluirPaciente,
  listarPacientes,
} from '../services/pacientes';
import {
  COMPRIMENTO_MAXIMO_CPF_FORMATADO,
  TAMANHO_MAXIMO_NOME,
  TAMANHO_MINIMO_NOME,
  cpfValido,
  formatarCpf,
  validarDadosPaciente,
} from '../utils/pacientes';

const pacientes = ref([]);
const carregando = ref(false);
const processando = ref(false);
const erro = ref('');
const mensagem = ref('');
const errosCampos = ref({});
const dialogo = ref(false);
const pacienteEditando = ref(null);
const formulario = ref({ nome: '', cpf: '' });
const cabecalhos = [
  { title: 'Nome', key: 'nome' },
  { title: 'CPF', key: 'cpf' },
  { title: 'Ações', key: 'acoes', sortable: false },
];

async function carregarPacientes() {
  carregando.value = true;
  try {
    pacientes.value = (await listarPacientes()).data || [];
    erro.value = '';
  } catch (falha) {
    erro.value = falha.message;
  } finally {
    carregando.value = false;
  }
}
onMounted(carregarPacientes);

function abrirCadastro(paciente = null) {
  pacienteEditando.value = paciente;
  formulario.value = paciente
    ? { nome: paciente.nome, cpf: paciente.cpf }
    : { nome: '', cpf: '' };
  errosCampos.value = {};
  erro.value = '';
  dialogo.value = true;
}
async function salvarPaciente() {
  erro.value = '';
  errosCampos.value = validarDadosPaciente(formulario.value.nome, formulario.value.cpf);
  if (Object.keys(errosCampos.value).length) return;
  processando.value = true;
  try {
    const dados = { nome: formulario.value.nome.trim(), cpf: formulario.value.cpf };
    await persistirPaciente(dados);
    dialogo.value = false;
    mensagem.value = 'Paciente salvo.';
    await carregarPacientes();
  } catch (falha) {
    errosCampos.value = falha.errors || {};
    erro.value = falha.status === 422 ? 'Revise os campos destacados.' : falha.message;
  } finally {
    processando.value = false;
  }
}

async function persistirPaciente(dados) {
  if (pacienteEditando.value) {
    await atualizarPaciente(pacienteEditando.value.id_paciente, dados);
    return;
  }
  await criarPaciente(dados);
}

async function confirmarExclusaoPaciente(paciente) {
  if (!window.confirm(`Excluir ${paciente.nome}?`)) return;
  await removerPaciente(paciente);
}

async function removerPaciente(paciente) {
  try {
    await excluirPaciente(paciente.id_paciente);
    mensagem.value = 'Paciente excluído.';
    await carregarPacientes();
  } catch (falha) {
    erro.value = falha.message;
  }
}
</script>

<template>
  <v-row align="center" class="mb-5">
    <v-col>
      <h1 class="text-h4">Pacientes</h1>
      <div class="text-body-2 text-medium-emphasis">
        Cadastre e mantenha os dados dos pacientes.
      </div>
    </v-col>
    <v-col cols="auto">
      <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirCadastro()">
        Novo paciente
      </v-btn>
    </v-col>
  </v-row>

  <v-alert
    v-if="erro"
    type="error"
    closable
    class="mb-4"
    @click:close="erro = ''"
  >
    {{ erro }}
  </v-alert>
  <v-alert
    v-if="mensagem"
    type="success"
    closable
    class="mb-4"
    @click:close="mensagem = ''"
  >
    {{ mensagem }}
  </v-alert>

  <v-card>
    <v-data-table
      :headers="cabecalhos"
      :items="pacientes"
      :loading="carregando"
      no-data-text="Nenhum paciente cadastrado."
    >
      <template #item.acoes="{ item }">
        <v-btn
          icon="mdi-pencil"
          variant="text"
          aria-label="Editar paciente"
          @click="abrirCadastro(item)"
        />
        <v-btn
          icon="mdi-delete"
          variant="text"
          aria-label="Excluir paciente"
          @click="confirmarExclusaoPaciente(item)"
        />
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="dialogo" max-width="480">
    <v-card>
      <v-card-title>
        {{ pacienteEditando ? 'Editar paciente' : 'Novo paciente' }}
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="salvarPaciente">
          <v-text-field
            v-model="formulario.nome"
            label="Nome completo"
            :maxlength="TAMANHO_MAXIMO_NOME"
            :counter="TAMANHO_MAXIMO_NOME"
            :error-messages="errosCampos.nome"
            :rules="[
              valor => !!valor?.trim() || 'O nome é obrigatório',
              valor => valor.trim().length >= TAMANHO_MINIMO_NOME || 'Use no mínimo 3 caracteres',
              valor => valor.trim().length <= TAMANHO_MAXIMO_NOME || 'Use no máximo 50 caracteres',
            ]"
            required
          />
          <v-text-field
            :model-value="formulario.cpf"
            label="CPF"
            placeholder="000.000.000-00"
            :maxlength="COMPRIMENTO_MAXIMO_CPF_FORMATADO"
            :error-messages="errosCampos.cpf"
            :rules="[valor => cpfValido(valor) || 'Use o formato indicado']"
            required
            @update:model-value="formulario.cpf = formatarCpf($event)"
          />
          <div class="d-flex justify-end ga-2">
            <v-btn variant="text" @click="dialogo = false">Cancelar</v-btn>
            <v-btn type="submit" color="primary" :loading="processando">
              Salvar
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
