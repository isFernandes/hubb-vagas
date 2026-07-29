# Design Spec: Improvement 1.1 - Worker de Exclusão (LGPD)

## Goal
Implementar conformidade com a LGPD (Lei Geral de Proteção de Dados) permitindo que candidatos solicitem a exclusão de seus dados pessoais (direito ao esquecimento) de forma assíncrona, preservando o histórico contábil e de reputação das empresas de forma anonimizada.

## Architecture
1. **Solicitação:**
   - O usuário solicita a exclusão fornecendo sua senha na rota `POST /users/profile/delete-request`.
   - A conta (`Account`) é suspensa temporariamente e o evento `user_deletion_requested` é emitido via RabbitMQ.
2. **Processamento Assíncrono:**
   - O worker `LgpdDeletionConsumer` consome o evento e limpa dados identificáveis das tabelas `User` (nome para "Usuário Anonimizado", CPF/bio/avatar para null) e `Account` (e-mail modificado para hash e senha invalidada).
   - Relacionamentos com `Review` e `Transaction` são mantidos intactos, garantindo a integridade dos dados estatísticos da plataforma.

## Proposed Changes
- [users.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/users/users.service.ts): Adicionar método de solicitação e publicação de evento.
- [lgpd-deletion.worker.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/users/lgpd-deletion.worker.ts): [NEW] Consumer para processamento em background da exclusão.
- [Settings.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/candidate/Settings.tsx): Adicionar modal de confirmação de exclusão com senha.

## Verification
- Teste unitário verificando validação de senha na solicitação de exclusão.
- Teste de integração do worker verificando que dados sensíveis são limpos e relações mantidas.
