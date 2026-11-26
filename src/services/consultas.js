import { solicitarApi } from './api';

export const ITENS_POR_PAGINA = 10;

export function listarConsultas(filtros = {}) {
  const parametros = new URLSearchParams({
    page: String(filtros.pagina || 1),
    per_page: String(filtros.itensPorPagina || ITENS_POR_PAGINA),
  });
  ['nome', 'cpf', 'status', 'data'].forEach((campo) => {
    if (filtros[campo]) parametros.set(campo, filtros[campo]);
  });
  return solicitarApi(`/consultas?${parametros}`);
}

export const criarConsulta = (dados) => solicitarApi('/agenda-consulta', {
  method: 'POST',
  body: JSON.stringify(dados),
});

export const atualizarConsulta = (idConsulta, dados) => solicitarApi(`/consulta/${idConsulta}/editar`, {
  method: 'PATCH',
  body: JSON.stringify(dados),
});

export const remarcarConsulta = (idConsulta, dados) => solicitarApi(`/consulta/${idConsulta}/remarcar`, {
  method: 'PATCH',
  body: JSON.stringify(dados),
});

export const alterarStatusConsulta = (idConsulta, novoStatus) => solicitarApi(`/consulta/${idConsulta}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status: novoStatus }),
});

export const cancelarConsulta = (idConsulta) => solicitarApi(`/consulta/${idConsulta}/cancelar`, {
  method: 'PATCH',
});

export const excluirConsulta = (idConsulta) => solicitarApi(`/consulta/${idConsulta}`, {
  method: 'DELETE',
});
