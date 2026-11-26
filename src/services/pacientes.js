import { solicitarApi } from './api';

export const listarPacientes = () => solicitarApi('/pacientes');
export const criarPaciente = (dados) => solicitarApi('/pacientes', {
  method: 'POST',
  body: JSON.stringify(dados),
});

export const atualizarPaciente = (idPaciente, dados) => solicitarApi(`/pacientes/${idPaciente}`, {
  method: 'PUT',
  body: JSON.stringify(dados),
});

export const excluirPaciente = (idPaciente) => solicitarApi(`/pacientes/${idPaciente}`, {
  method: 'DELETE',
});
