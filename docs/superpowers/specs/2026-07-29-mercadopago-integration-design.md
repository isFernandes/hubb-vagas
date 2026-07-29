# Mercado Pago Checkout Pro Integration Design

## Overview
Integração do Mercado Pago Checkout Pro (Redirect) para a plataforma Hubb Vagas. O objetivo é permitir cobrança (com potencial Split Payment) por trabalhos fechados/executados na plataforma, suportando apenas Pix e Cartões (Boletos desativados).

## Architecture
- **Backend (NestJS):** Responsável por gerenciar a segurança e criação das *Preferences* do Mercado Pago, além de ouvir os webhooks.
- **Frontend (React SPA):** Redireciona o usuário para o gateway de pagamento (Checkout Pro) e exibe telas de sucesso/falha ao retornar.
- **Banco de Dados (Postgres/Prisma):** Tabela de transações financeiras e atualização de status do `Job`/`Application`.

## Component Details

### 1. Payments Module (Backend)
- `POST /jobs/:id/checkout`: 
  - Gera a *Preference* via Mercado Pago SDK.
  - **Configurações Específicas:**
    - Exclusão do método de pagamento `ticket` (Boleto/Lotéricas).
    - Configuração de `payment_methods` para aceitar apenas credit_card, debit_card e pix.
    - Suporte para Split Payments via `marketplace_fee` (taxa de retenção de R$0.99 da plataforma).
  - Retorna o `init_point` gerado.

### 2. Webhooks & IPN (Backend)
- `POST /webhooks/mercadopago`:
  - Recebe o ID do pagamento gerado pelo evento do webhook.
  - Consulta o endpoint da API do Mercado Pago `GET /v1/payments/:id` para confirmar o status da transação.
  - Em caso de status `approved`, atualiza o banco de dados (ex: status da vaga, histórico financeiro).

### 3. Frontend Flow
- Ação do usuário: Clica em "Pagar" na interface de pagamento.
- Chamada para `POST /jobs/:id/checkout`.
- `window.location.href = response.init_point`.
- Configuração de `back_urls` na Preference para retornar a `/pagamento/sucesso` ou `/pagamento/falha`.

## Data Flow
1. Usuário inicia checkout no Front.
2. NestJS cria Preference no MP e devolve URL.
3. Usuário paga no ambiente seguro do MP.
4. MP redireciona usuário para sucesso/falha.
5. MP envia Webhook (IPN) assincronamente para o NestJS.
6. NestJS valida IPN e atualiza o DB.

## Error Handling & Security
- O Frontend **nunca** define o status do pagamento como pago com base apenas no redirecionamento. Toda a inteligência de validação reside no Webhook do Backend.
- Consulta direta à API do MP no recebimento do Webhook para garantir que a notificação é autêntica e evitar fraudes (spoofing).
