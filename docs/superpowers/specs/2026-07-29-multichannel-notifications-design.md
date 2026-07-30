# Design Spec: Improvement 3.2 - Notificações Multicanal

## Goal
Implementar entrega de notificações em múltiplos canais (WhatsApp e Web Push) além do e-mail padrão, notificando candidatos de forma célere sobre aprovações, rejeições e novas candidaturas para vagas.

## Architecture
1. **Banco de Dados (Prisma):**
   - Criar modelo `PushSubscription` associado à tabela `Account` para registrar as credenciais de assinatura push do navegador (endpoint, chaves p256dh e auth).
2. **Integração do WhatsApp (Gateway Flexível):**
   - Criar `WhatsappService` utilizando requisições simples de POST baseadas em `WHATSAPP_API_URL` e `WHATSAPP_API_TOKEN` no `.env`.
   - Se as variáveis não estiverem configuradas, executa um mock em log para desenvolvimento local.
3. **Web Push (VAPID):**
   - Utilizar biblioteca `web-push` configurada com chaves VAPID geradas no `.env`.
   - Expor endpoint `POST /notifications/push-subscription` para registrar inscrições ativas.
4. **Trigger de Eventos:**
   - Integrar no consumer do RabbitMQ `NotificationsConsumer` as rotas de disparos paralelos via SMS/WhatsApp e Web Push baseadas no cadastro de preferências do perfil.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Adicionar modelo `PushSubscription`.
- [whatsapp.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/notifications/whatsapp.service.ts): [NEW] Serviço de integração HTTP com gateways genéricos de WhatsApp.
- [push.controller.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/notifications/push.controller.ts): [NEW] Endpoint de subscrição de tokens VAPID.
- [notifications.consumer.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/notifications/notifications.consumer.ts): Acoplamento de envios multicanal assíncronos.
- [Settings.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/candidate/Settings.tsx): Painel de preferências de canais de notificação.
- [service-worker.js](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/public/service-worker.js): [NEW] Registro de eventos e notificações do navegador no background.

## Verification
- Teste unitário certificando formatação de requisições POST do `WhatsappService`.
- Teste de integração do registro de subscrições e validação de chaves VAPID.
