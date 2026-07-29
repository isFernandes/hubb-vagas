# Design Spec: Item 13.5 - Gestão Financeira e Disputas

## Goal
Implementar o controle financeiro completo do fluxo de pagamentos (custódia temporária, comissões de taxas da plataforma e resolução de disputas financeiras por administradores).

## Architecture
1. **Database Schema:**
   - Criação da tabela `Transaction` (Prisma) com suporte aos status: `PENDING`, `APPROVED`, `SETTLED`, `DISPUTED` e `REFUNDED`.
2. **Escrow and Dispute Workflow:**
   - Entrada em custódia: Webhook do Mercado Pago atualiza pagamento, cria a transação como `APPROVED` e calcula `feeCents` a partir da taxa do `GlobalConfig`.
   - Período de Disputa: Empresa tem até 24h para acionar `POST /transactions/:id/dispute` alterando status para `DISPUTED`.
   - Cron Job de Liquidação: Um worker cron de hora em hora varre transações `APPROVED` com mais de 24h e as atualiza para `SETTLED`.
   - Moderação Admin: Painel administrativo para resolver transações `DISPUTED`, liquidando como `SETTLED` ou devolvendo como `REFUNDED`.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Criação do modelo `Transaction` e seu enum de status.
- [payments.controller.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/payments/payments.controller.ts): Lógica de persistência e cálculo de taxa administrativa na transação pós-pagamento.
- [disputes.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/payments/disputes.service.ts): [NEW] Controle de abertura e resolução de disputas.
- [settlement.cron.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/payments/settlement.cron.ts): [NEW] Cron de liquidação automática de custódia de 24h.
- [Dashboard.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/admin/Dashboard.tsx): Métricas contábeis (GMV e comissões arrecadadas).
- [Disputes.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/admin/Disputes.tsx): [NEW] Painel administrativo de moderação financeira.

## Verification
- Teste unitário para validar cálculo exato da porcentagem de taxa em centavos no ledger.
- Teste unitário para verificar se a tentativa de disputar transações com mais de 24h é devidamente rejeitada.
- Teste de integração do cron job verificando liquidação automática de registros elegíveis.
