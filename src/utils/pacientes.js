export const TAMANHO_MINIMO_NOME = 3;
export const TAMANHO_MAXIMO_NOME = 50;
export const COMPRIMENTO_MAXIMO_CPF_FORMATADO = 14;
const PADRAO_CPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

export function formatarCpf(valor) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function cpfValido(cpf) {
  return PADRAO_CPF.test(cpf);
}

export function nomeValido(nome) {
  const tamanho = nome.trim().length;
  return tamanho >= TAMANHO_MINIMO_NOME && tamanho <= TAMANHO_MAXIMO_NOME;
}

export function validarDadosPaciente(nome, cpf) {
  const erros = {};
  if (!nomeValido(nome)) erros.nome = `Informe de ${TAMANHO_MINIMO_NOME} a ${TAMANHO_MAXIMO_NOME} caracteres.`;
  if (!cpfValido(cpf)) erros.cpf = 'Use o formato 000.000.000-00.';
  return erros;
}
