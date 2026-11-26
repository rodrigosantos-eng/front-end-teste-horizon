const URL_BASE_API = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export async function solicitarApi(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${URL_BASE_API}${caminho}`, {
      ...opcoes,
      headers: {
        Accept: 'application/json',
        ...(opcoes.body ? { 'Content-Type': 'application/json' } : {}),
        ...opcoes.headers,
      },
    });
  } catch {
    throw new ErroDaApi('Não foi possível conectar à API. Confira se o servidor está ativo.', 0, {});
  }
  const respostaApi = await lerResposta(resposta);
  if (!resposta.ok) throw criarErroDaResposta(resposta, respostaApi);
  return respostaApi;
}

async function lerResposta(resposta) {
  if (resposta.status === 204) return {};
  return resposta.json().catch(() => ({}));
}

function criarErroDaResposta(resposta, dados) {
  const erros = dados.errors || {};
  const detalhes = Object.values(erros).flat().join(' ');
  const mensagem = mensagemDoErro(resposta.status, dados.message, detalhes);
  return new ErroDaApi(mensagem, resposta.status, erros);
}

function mensagemDoErro(status, mensagemApi, detalhes) {
  if (status === 404) return mensagemApi || 'O registro solicitado não foi encontrado.';
  if (status >= 500) return 'O servidor encontrou um erro. Tente novamente.';
  return detalhes || mensagemApi || `A solicitação falhou (${status}).`;
}

export class ErroDaApi extends Error {
  constructor(mensagem, status, erros) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.errors = erros;
  }
}
