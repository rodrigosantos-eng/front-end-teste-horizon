export const ROTULOS_STATUS = {
  agendada: 'Agendada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
};

const FUSO_HORARIO = 'America/Bahia';
const CONFIGURACAO_DATA_BAHIA = {
  timeZone: FUSO_HORARIO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

export function formatarDataHora(valor) {
  if (!valor) return null;
  const dataBrasileira = String(valor).match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/);
  if (dataBrasileira) {
    const [, dia, mes, ano, hora, minuto] = dataBrasileira;
    const valores = { dia: Number(dia), mes: Number(mes), ano: Number(ano), hora: Number(hora), minuto: Number(minuto) };
    if (valores.mes < 1 || valores.mes > 12 || valores.hora > 23 || valores.minuto > 59) return null;
    const dataCivil = new Date(Date.UTC(valores.ano, valores.mes - 1, valores.dia));
    if (dataCivil.getUTCDate() !== valores.dia || dataCivil.getUTCMonth() !== valores.mes - 1) return null;
    return new Date(Date.UTC(valores.ano, valores.mes - 1, valores.dia, valores.hora + 3, valores.minuto));
  }
  const dataISO = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!dataISO) return null;
  return new Date(`${dataISO[1]}-${dataISO[2]}-${dataISO[3]}T${dataISO[4] || '00'}:${dataISO[5] || '00'}:00-03:00`);
}

export function hojeEmBahia() {
  return new Intl.DateTimeFormat('en-CA', CONFIGURACAO_DATA_BAHIA).format(new Date());
}

export function podeConcluir(consulta) {
  if (consulta.status !== STATUS_AGENDADA) return false;
  const data = formatarDataHora(consulta.data_consulta);
  if (!data) return false;
  const diaAgendado = new Intl.DateTimeFormat('en-CA', CONFIGURACAO_DATA_BAHIA).format(data);
  return diaAgendado === hojeEmBahia();
}


export function formatarData(valor) {
  const data = formatarDataHora(valor);
  return data ? new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO_HORARIO, day: '2-digit', month: '2-digit', year: 'numeric' }).format(data) : '—';
}

export function formatarHorario(valor) {
  const data = formatarDataHora(valor);
  return data ? new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO_HORARIO, hour: '2-digit', minute: '2-digit', hour12: false }).format(data) : '—';
}

export function dataHoraFutura(valor) {
  const data = formatarDataHora(valor);
  return Boolean(data && data > new Date());
}

export const TAMANHO_MINIMO_ESPECIALIDADE = 3;
export const TAMANHO_MAXIMO_ESPECIALIDADE = 50;
export const TAMANHO_MAXIMO_OBSERVACAO = 1000;
export const STATUS_AGENDADA = 'agendada';
export const STATUS_REALIZADA = 'realizada';
