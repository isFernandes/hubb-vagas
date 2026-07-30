# Design Spec: Improvement 5.1 - Planos de Assinatura (SaaS)

## Goal
Implementar planos de assinatura recorrente (FREE vs PREMIUM) para empresas utilizando o Mercado Pago Subscriptions, limitando a quantidade de vagas ativas simultâneas no plano gratuito sem restringir funcionalidades internas.

## Architecture
1. **Banco de Dados (Prisma):**
   - Adicionar o enum `PlanType` (`FREE`, `PREMIUM`).
   - Adicionar `plan PlanType @default(FREE)` e `subscriptionActiveUntil DateTime?` à tabela `Company`.
2. **Restrições Comerciais (Gating):**
   - Empresas no plano `FREE` estão limitadas a ter no máximo **2 vagas ativas simultaneamente** (status `PUBLISHED`).
   - Tentativas de criar ou publicar uma vaga quando este limite é excedido resultam em erro `ForbiddenException`.
   - Quizzes, chat, matching e geolocalização continuam liberados sem restrições para todas as empresas.
3. **Checkout Recorrente:**
   - Webhook do Mercado Pago intercepta transações de cobrança recorrente, atualizando o plano da empresa para `PREMIUM` e estendendo `subscriptionActiveUntil` em 30 dias.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Adicionar o enum `PlanType` e campos correspondentes no modelo `Company`.
- [jobs.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/jobs/jobs.service.ts): Lógica de validação do limite de 2 vagas ativas no fluxo de publicação/criação.
- [payments.controller.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/payments/payments.controller.ts): Webhook de recebimento e renovação da assinatura.
- [Settings.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/Settings.tsx): Painel de gerenciamento de assinatura e upgrade de plano.
- [NewJob.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/company/NewJob.tsx): Alerta visual e bloqueio de criação caso o limite do plano grátis seja alcançado.

## Verification
- Teste unitário para certificar bloqueio de criação de vagas adicionais caso o limite de 2 vagas ativas simultâneas seja alcançado.
- Teste de integração do webhook de checkout recorrente.
