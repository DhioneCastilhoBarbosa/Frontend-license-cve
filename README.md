## Frontend License/CVE

Aplicação web (React + TypeScript) para gerenciar **licenças** e **chaves** (CVE), com autenticação e telas em modo tabela + modais de confirmação/edição.

### Tecnologias

- React + TypeScript
- Tailwind CSS
- Axios (HTTP)
- Headless UI (modais)
- Sonner (toasts)
- Lucide React (ícones)
- React Router (rotas e proteção)

## Rotas

- `/solicitar-chave` (pública): solicitar/criar chave de acesso.
- `/login` (pública): login.
- `/cadastro` (pública): cadastro.
- `/dashboard` (protegida): área logada.
  - Dentro do `/dashboard`, o componente exibido pode alternar entre **Licenças** e **Chaves** via o menu do `Header` (estado local).

Ao acessar `/`, o app redireciona para `/solicitar-chave`.

## Autenticação e token

- A integração com a API é feita em `src/services/api.ts` via Axios.
- O token é lido de `localStorage.getItem('token')` e enviado como:
  - `Authorization: Bearer <token>`
- A rota `/dashboard` é protegida por `PrivateRoute`, usando:
  - `localStorage.getItem('authenticated') === "true"`
  - `localStorage.getItem('expires_at')` (timestamp em ms)

## Endpoints usados (frontend -> backend)

> Observação: os endpoints abaixo são os que o front consome atualmente.

### Licenças

- Listar: `GET /licencas`
- Criar: `POST /criar-licenca`
  - Payload (exemplo):
    ```json
    {
      "codigo_compra": "XXXXXXXXXXX",
      "email": "email@email.com",
      "nome": "Dhione Castilho",
      "quantidade": 1,
      "validade": 12
    }
    ```
- Deletar: `DELETE /deletar-licenca?codigo=<CODIGO>`
- Atualizar status (somente quando não é “coringa”):
  - `PUT /atualizar-licenca`
  - Corpo:
    ```json
    {
      "codigo": "<CODIGO>",
      "status": "Ativada"
    }
    ```
  - Status suportados pelo UI: `Ativada`, `Criada`, `Expirada`.

### Chaves

- Solicitar/criar: `POST /criar-chave`
  - Corpo:
    ```json
    { "cpf": "<CPF>", "email": "<EMAIL>", "nome": "<NOME>" }
    ```
- Listar: `GET /chaves`
- Deletar: `DELETE /deletar-chave?chave=<CHAVE>`
- Atualizar status (somente `Ativada` e `Criada`):
  - `PUT /atualizar-status-chave`
  - Corpo:
    ```json
    {
      "chave": "<CHAVE>",
      "status": "Criada"
    }
    ```

## Como rodar localmente

1. Instale dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. (Opcional) Build:
   ```bash
   npm run build
   ```
4. (Opcional) Lint:
   ```bash
   npm run lint
   ```

## Observações

- O `baseURL` da API está definido em `src/services/api.ts` (hardcoded).
- Não há pipeline de testes configurada (script `test` ainda é placeholder).
