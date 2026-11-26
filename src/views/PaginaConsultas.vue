<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { ITENS_POR_PAGINA, listarConsultas, criarConsulta, atualizarConsulta, cancelarConsulta, alterarStatusConsulta, excluirConsulta, remarcarConsulta } from '../services/consultas';
import { listarPacientes } from '../services/pacientes';
import { ROTULOS_STATUS, STATUS_AGENDADA, STATUS_REALIZADA, podeConcluir, formatarData, formatarHorario, dataHoraFutura, TAMANHO_MINIMO_ESPECIALIDADE, TAMANHO_MAXIMO_ESPECIALIDADE, TAMANHO_MAXIMO_OBSERVACAO } from '../utils/consultas';
import { TAMANHO_MINIMO_NOME, TAMANHO_MAXIMO_NOME, cpfValido, nomeValido } from '../utils/pacientes';

const consultas = ref([]);
const pacientes = ref([]);
const carregando = ref(false);
const processando = ref(false);
const erro = ref('');
const mensagem = ref('');
const errosCampos = ref({});
const estadoFiltro = ref('');
const dataFiltro = ref('');
const nomeFiltro = ref('');
const cpfFiltro = ref('');
const pagina = ref(1);
const total = ref(0);
const dialogo = ref(false);
const dataSelecionada = ref('');
const horarioSelecionado = ref('');
const consultaEditando = ref(null);
const formulario = ref({ paciente_id: null, data_consulta: '', especialidade: '', observacao: '' });
const cabecalhos = [
  { title: 'Paciente', key: 'paciente.nome' },
  { title: 'CPF', key: 'paciente.cpf' },
  { title: 'Data', key: 'data_consulta' },
  { title: 'Horário', key: 'horario' },
  { title: 'Especialidade', key: 'especialidade' },
  { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'acoes', sortable: false },
];
const opcoesStatus = Object.entries(ROTULOS_STATUS).map(([valor, titulo]) => ({ title: titulo, value: valor }));
const podeEnviar = computed(() => Boolean(
  formulario.value.paciente_id
  && (!consultaEditando.value || (
    nomeValido(formulario.value.nome)
    && cpfValido(formulario.value.cpf)
  ))
  && formulario.value.especialidade.trim().length >= TAMANHO_MINIMO_ESPECIALIDADE
  && formulario.value.especialidade.length <= TAMANHO_MAXIMO_ESPECIALIDADE
  && formulario.value.observacao.length <= TAMANHO_MAXIMO_OBSERVACAO
  && dataHoraFutura(formulario.value.data_consulta)
));
const dataMinima = computed(() => {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
});
const dataSelecionadaFormatada = computed(() => dataSelecionada.value ? dataSelecionada.value.split('-').reverse().join('/') : '');

async function carregarConsultas() {
  carregando.value = true;
  erro.value = '';
  try {
    const resposta = await listarConsultas({ pagina: pagina.value, status: estadoFiltro.value, data: dataFiltro.value, nome: nomeFiltro.value, cpf: cpfFiltro.value });
    consultas.value = resposta.data || [];
    total.value = resposta.meta?.total || 0;
  } catch (falha) {
    erro.value = falha.message;
  } finally {
    carregando.value = false;
  }
}

async function carregarPacientes() {
  try {
    pacientes.value = (await listarPacientes()).data || [];
  } catch (falha) {
    erro.value = falha.message;
  }
}

function carregarDadosIniciais() {
  carregarConsultas();
  carregarPacientes();
}

onMounted(carregarDadosIniciais);
watch([estadoFiltro, dataFiltro, nomeFiltro, cpfFiltro], carregarConsultasComFiltros);

function carregarConsultasComFiltros() {
  pagina.value = 1;
  carregarConsultas();
}

function abrirFormulario() {
  consultaEditando.value = null;
  formulario.value = { paciente_id: null, data_consulta: '', especialidade: '', observacao: '' };
  dataSelecionada.value = '';
  horarioSelecionado.value = '';
  errosCampos.value = {};
  erro.value = '';
  dialogo.value = true;
}

function abrirEdicao(consulta) {
  if (consulta.status !== STATUS_AGENDADA) return;
  consultaEditando.value = consulta;
  const [data, horario] = consulta.data_consulta.split(' ');
  dataSelecionada.value = data.split('/').reverse().join('-');
  horarioSelecionado.value = horario;
  formulario.value = {
    paciente_id: consulta.paciente_id,
    nome: consulta.paciente?.nome || '',
    cpf: consulta.paciente?.cpf || '',
    data_consulta: consulta.data_consulta,
    especialidade: consulta.especialidade,
    observacao: consulta.observacao || '',
  };
  errosCampos.value = {};
  erro.value = '';
  dialogo.value = true;
}

function atualizarDataHora() {
  formulario.value.data_consulta = dataSelecionada.value && horarioSelecionado.value
    ? `${dataSelecionadaFormatada.value} ${horarioSelecionado.value}`
    : '';
}

function selecionarData(valor) {
  dataSelecionada.value = valor;
  atualizarDataHora();
}

async function salvarConsulta() {
  processando.value = true;
  erro.value = '';
  errosCampos.value = {};
  try {
    await persistirConsulta();
    dialogo.value = false;
    consultaEditando.value = null;
    await carregarConsultas();
    await carregarPacientes();
  } catch (falha) {
    errosCampos.value = falha.errors || {};
    erro.value = falha.status === 422
      ? 'O backend recusou alguns dados. Confira os campos destacados.'
      : falha.message;
  } finally {
    processando.value = false;
  }
}

async function persistirConsulta() {
  if (consultaEditando.value) {
    await atualizarConsulta(consultaEditando.value.id_consulta, dadosDaEdicao());
    mensagem.value = 'Consulta atualizada.';
    return;
  }
  await criarConsulta(dadosDaNovaConsulta());
  mensagem.value = 'Consulta agendada.';
}

function dadosDaEdicao() {
  return {
    nome: formulario.value.nome,
    cpf: formulario.value.cpf,
    data_consulta: formulario.value.data_consulta,
    especialidade: formulario.value.especialidade,
  };
}

function dadosDaNovaConsulta() {
  return {
    paciente_id: formulario.value.paciente_id,
    data_consulta: formulario.value.data_consulta,
    especialidade: formulario.value.especialidade,
    observacao: formulario.value.observacao,
  };
}

async function executarAcaoConsulta(acao) {
  processando.value = true;
  try {
    await acao();
    mensagem.value = 'Consulta atualizada.';
    await carregarConsultas();
  } catch (falha) {
    erro.value = falha.message;
  } finally {
    processando.value = false;
  }
}

function concluir(consulta) {
  if (podeConcluir(consulta)) executarAcaoConsulta(() => alterarStatusConsulta(consulta.id_consulta, 'realizada'));
}

function cancelar(consulta) {
  if (consulta.status === STATUS_AGENDADA) executarAcaoConsulta(() => cancelarConsulta(consulta.id_consulta));
}

function excluir(consulta) {
  if (window.confirm('Excluir esta consulta definitivamente?')) executarAcaoConsulta(() => excluirConsulta(consulta.id_consulta));
}

function remarcar(consulta) {
  if (consulta.status !== STATUS_AGENDADA) return;
  const novaData = window.prompt('Nova data e hora (dd/mm/aaaa hh:mm):');
  if (!novaData) return;
  if (!dataHoraFutura(novaData)) {
    erro.value = 'Escolha uma data futura.';
    return;
  }
  executarAcaoConsulta(() => remarcarConsulta(consulta.id_consulta, { data_consulta: novaData }));
}
</script>

<template>
  <v-row align="center" class="mb-5">
    <v-col>
      <h1 class="text-h4">Consultas</h1>
      <div class="text-body-2 text-medium-emphasis">
        Agende e acompanhe as consultas.
      </div>
    </v-col>
    <v-col cols="auto">
      <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirFormulario">
        Nova consulta
      </v-btn>
    </v-col>
  </v-row>

  <v-alert v-if="erro" type="error" closable class="mb-4" @click:close="erro = ''">
    {{ erro }}
  </v-alert>
  <v-alert v-if="mensagem" type="success" closable class="mb-4" @click:close="mensagem = ''">
    {{ mensagem }}
  </v-alert>

  <v-card>
    <v-card-title class="d-flex flex-wrap ga-3 py-4">
      <v-select
        v-model="estadoFiltro"
        label="Status"
        :items="[{ title: 'Todos', value: '' }, ...opcoesStatus]"
        item-title="title"
        item-value="value"
        hide-details
        density="compact"
        clearable
        class="filter-control"
      />
      <v-text-field
        v-model="nomeFiltro"
        label="Buscar paciente"
        hide-details
        density="compact"
        class="filter-control"
      />
      <v-text-field
        v-model="cpfFiltro"
        label="Buscar CPF"
        hide-details
        density="compact"
        class="filter-control"
      />
      <v-text-field
        v-model="dataFiltro"
        label="Data"
        type="date"
        hide-details
        density="compact"
        class="filter-control"
      />
    </v-card-title>
    <v-data-table-server
      :headers="cabecalhos"
      :items="consultas"
      :items-length="total"
      :loading="carregando"
      :page="pagina"
      :items-per-page="ITENS_POR_PAGINA"
      @update:page="pagina = $event; carregarConsultas()"
    >
      <template #item.data_consulta="{ item }">
        {{ formatarData(item.data_consulta) }}
      </template>
      <template #item.horario="{ item }">
        {{ formatarHorario(item.data_consulta) }}
      </template>
      <template #item.status="{ item }">
        <v-chip
          size="small"
          :color="item.status === STATUS_AGENDADA ? 'primary' : item.status === STATUS_REALIZADA ? 'secondary' : 'grey'"
        >
          {{ item.status }}
        </v-chip>
      </template>
      <template #item.acoes="{ item }">
        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" />
          </template>
          <v-list density="compact">
            <v-list-item v-if="item.status === STATUS_AGENDADA" title="Editar" @click="abrirEdicao(item)" />
            <v-list-item v-if="podeConcluir(item)" title="Marcar realizada" @click="concluir(item)" />
            <v-list-item v-if="item.status === STATUS_AGENDADA" title="Remarcar" @click="remarcar(item)" />
            <v-list-item v-if="item.status === STATUS_AGENDADA" title="Cancelar" @click="cancelar(item)" />
            <v-list-item title="Excluir" @click="excluir(item)" />
          </v-list>
        </v-menu>
      </template>
    </v-data-table-server>
  </v-card>

  <v-dialog v-model="dialogo" max-width="560">
    <v-card>
      <v-card-title>
        {{ consultaEditando ? 'Editar consulta' : 'Agendar consulta' }}
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="salvarConsulta">
          <v-autocomplete
            v-if="!consultaEditando"
            v-model="formulario.paciente_id"
            label="Paciente"
            :items="pacientes"
            item-title="nome"
            item-value="id_paciente"
            :error-messages="errosCampos.paciente_id"
            no-data-text="Cadastre primeiro um paciente"
            required
          />
          <template v-if="consultaEditando">
            <v-text-field
              v-model="formulario.nome"
              label="Nome do paciente"
              :error-messages="errosCampos.nome"
              :rules="[
                valor => valor.trim().length >= TAMANHO_MINIMO_NOME || 'Use no mínimo 3 caracteres',
                valor => valor.trim().length <= TAMANHO_MAXIMO_NOME || 'Use no máximo 50 caracteres',
              ]"
            />
            <v-text-field
              v-model="formulario.cpf"
              label="CPF"
              :error-messages="errosCampos.cpf"
            />
          </template>
          <v-text-field
            v-model="formulario.especialidade"
            label="Especialidade"
            :maxlength="TAMANHO_MAXIMO_ESPECIALIDADE"
            :error-messages="errosCampos.especialidade"
            :rules="[
              valor => !!valor || 'A especialidade é obrigatória',
              valor => (valor?.trim().length ?? 0) >= TAMANHO_MINIMO_ESPECIALIDADE || 'Use no mínimo 3 caracteres',
              valor => (valor?.length ?? 0) <= TAMANHO_MAXIMO_ESPECIALIDADE || 'Use no máximo 50 caracteres',
            ]"
            required
          />
        <div class="d-flex ga-3 align-start">
          <v-text-field
            v-model="dataSelecionada"
            label="Data"
            type="date"
            prepend-inner-icon="mdi-calendar"
            :min="dataMinima"
            :error-messages="errosCampos.data_consulta"
            @update:model-value="selecionarData"
          />
          <v-text-field
            v-model="horarioSelecionado"
            label="Horário"
            type="time"
            @update:model-value="atualizarDataHora"
          />
        </div>
          <div class="text-caption text-medium-emphasis mb-3">
            Formato enviado à API: {{ formulario.data_consulta || 'dd/mm/aaaa hh:mm' }}
          </div>
          <div
            v-if="formulario.data_consulta && !dataHoraFutura(formulario.data_consulta)"
            class="text-error text-caption mb-3"
          >
            Escolha uma data e horário futuros.
          </div>
          <v-textarea
            v-if="!consultaEditando"
            v-model="formulario.observacao"
            label="Observação"
            rows="2"
            :maxlength="TAMANHO_MAXIMO_OBSERVACAO"
            :counter="TAMANHO_MAXIMO_OBSERVACAO"
            :error-messages="errosCampos.observacao"
            :rules="[
              valor => !valor || valor.length <= TAMANHO_MAXIMO_OBSERVACAO || 'Use no máximo 1000 caracteres',
            ]"
          />
          <div class="d-flex justify-end ga-2">
            <v-btn variant="text" @click="dialogo = false">Fechar</v-btn>
            <v-btn
              type="submit"
              color="primary"
              :loading="processando"
              :disabled="!podeEnviar"
            >
              Agendar
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.filter-control {
  max-width: 220px;
  min-width: 170px;
}
</style>
