# Teste Técnico Horizon — Front-end

Aplicação web para gerenciar consultas e pacientes. O front-end oferece formulários, listagens, filtros e ações de consulta e envia as operações para uma API configurada por variável de ambiente.

## Tecnologias

Versões resolvidas no `package-lock.json`:

- Vue 3.5.46
- Vue Router 4.6.5
- Vuetify 3.13.8
- Vite 6.4.6
- `@mdi/font` 7.4.47
- JavaScript com módulos ES

## Funcionalidades

- Lista e filtra consultas por status, data, nome e CPF, com paginação de 10 itens.
- Cria e edita consultas.
- Permite remarcar ou cancelar consultas agendadas.
- Permite marcar uma consulta como realizada somente no dia agendado.
- Lista, cadastra, edita e exclui pacientes.
- Exibe erros retornados pela API e valida os formulários no front-end.

## Pré-requisitos

- Node.js 18.x, 20.x ou 22 ou superior, conforme as versões instaladas do Vite e do plugin Vue.
- npm.
- A API usada pelo front-end, disponível no endereço configurado em `VITE_API_URL`.

## Instalação e execução

```powershell
git clone https://github.com/rodrigosantos-eng/front-end-teste-horizon.git
cd front-end-teste-horizon
npm install
```

O front-end usa `http://localhost:8000/api` como endereço padrão da API. Para configurar outro endereço, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

```powershell
Copy-Item .env.example .env
npm run dev
```

O Vite informa no terminal o endereço local da aplicação. A API precisa estar acessível para carregar e salvar dados.

Para gerar a versão de produção:

```powershell
npm run build
```

Para servir localmente o conteúdo gerado em `dist/`:

```powershell
npm run preview
```

## Variáveis de ambiente

| Nome | Descrição | Exemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base usada pelo cliente HTTP. O valor padrão no código é `http://localhost:8000/api`. | `http://localhost:8000/api` |

## Estrutura do projeto

```text
.
├── index.html
├── src/
│   ├── App.vue
│   ├── main.js
│   ├── router.js
│   ├── style.css
│   ├── services/
│   │   ├── api.js
│   │   ├── consultas.js
│   │   └── pacientes.js
│   ├── utils/
│   │   ├── consultas.js
│   │   └── pacientes.js
│   └── views/
│       ├── PaginaConsultas.vue
│       └── PaginaPacientes.vue
├── .env.example
├── package.json
└── vite.config.js
```

- `src/views/`: telas de consultas e pacientes.
- `src/services/`: requisições HTTP e funções de acesso à API.
- `src/utils/`: formatação de data e CPF, validações e regras de exibição de ações.
- `src/router.js`: rotas da interface; `/` redireciona para `/consultas`.
- `src/main.js`, `src/App.vue` e `src/style.css`: inicialização, layout principal, tema Vuetify e estilos globais.
- `vite.config.js`: configuração dos plugins Vue e Vuetify.

## API utilizada

O cliente HTTP envia `Accept: application/json` e, quando há corpo, `Content-Type: application/json`. O front-end não configura autenticação. As rotas abaixo são as chamadas feitas pelo código do cliente; a implementação do servidor não está neste repositório.

| Método | Rota | Finalidade |
| --- | --- | --- |
| `GET` | `/consultas` | Lista consultas. Envia `page`, `per_page` e, quando preenchidos, `nome`, `cpf`, `status` e `data`. |
| `POST` | `/agenda-consulta` | Cria consulta. |
| `PATCH` | `/consulta/{id}/editar` | Atualiza os dados editáveis da consulta. |
| `PATCH` | `/consulta/{id}/remarcar` | Altera a data e o horário da consulta. |
| `PATCH` | `/consulta/{id}/status` | Envia o novo status da consulta. |
| `PATCH` | `/consulta/{id}/cancelar` | Cancela consulta. |
| `DELETE` | `/consulta/{id}` | Exclui consulta. |
| `GET` | `/pacientes` | Lista pacientes. |
| `POST` | `/pacientes` | Cria paciente. |
| `PUT` | `/pacientes/{id}` | Atualiza paciente. |
| `DELETE` | `/pacientes/{id}` | Exclui paciente. |

Os caminhos são relativos a `VITE_API_URL`. O front-end lê a lista de consultas e pacientes de `data`; para consultas, também lê `meta.total`. Erros podem incluir `message` e `errors`.

Exemplo de criação de paciente enviado pelo front-end:

```http
POST /pacientes
Content-Type: application/json
Accept: application/json
```

```json
{
  "nome": "Maria Silva",
  "cpf": "111.111.111-11"
}
```

Exemplo de criação de consulta enviado pelo front-end:

```http
POST /agenda-consulta
Content-Type: application/json
Accept: application/json
```

```json
{
  "paciente_id": 1,
  "data_consulta": "30/11/2026 14:30",
  "especialidade": "Cardiologia",
  "observacao": "Retorno"
}
```

## Campos usados pela interface

O front-end usa pacientes com `id_paciente`, `nome` e `cpf`. Para consultas, usa `id_consulta`, `paciente_id`, `data_consulta`, `especialidade`, `observacao` e `status`. Nas listagens, também lê `paciente.nome` e `paciente.cpf`.

Esses são os campos consumidos pela interface; o schema do banco e os relacionamentos do backend não estão disponíveis neste repositório.

## Regras e validações no front-end

- Nome de paciente: de 3 a 50 caracteres.
- CPF: exige o formato `000.000.000-00`; a validação local verifica o formato.
- Especialidade: de 3 a 50 caracteres.
- Observação: até 1.000 caracteres.
- A data e o horário de uma consulta nova precisam estar no futuro.
- Editar, remarcar e cancelar ficam disponíveis somente para consultas com status `agendada`.
- A ação para marcar como `realizada` fica disponível somente para consulta agendada no dia correspondente, considerando o fuso `America/Bahia`.
- Os valores de status usados pela interface são `agendada`, `realizada` e `cancelada`.

As validações do front-end não substituem as regras da API.

## Testes e build

O comando de build disponível é:

```powershell
npm run build
```
