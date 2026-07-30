# Design Spec: Improvement 3.1 - Chat Interno Modularizado

## Goal
Implementar um sistema de chat em tempo real desacoplado e modular para comunicação entre candidatos e empresas, com ocultação dinâmica de contatos direto até que a contratação seja aprovada.

## Architecture
1. **Desacoplamento de Domínio (Banco de Dados):**
   - Os modelos `ChatRoom` e `Message` não possuem chaves estrangeiras nativas no Prisma para `Application` ou `User`. Os IDs são armazenados apenas como propriedades `String` normais, facilitando a migração futura para um banco isolado (Arquitetura de Microsserviços).
2. **Modularização no Backend:**
   - Todo o código residirá em `apps/api/src/chat/`.
   - A checagem de regras de negócio (status da candidatura para controle de máscara de contato) é feita via interface abstrata `ChatSecurityProvider`, permitindo trocar a checagem local de banco por uma requisição HTTP/gRPC no futuro.
3. **Mascaramento Dinâmico de Contatos:**
   - O banco de dados armazena a mensagem bruta. A API faz a filtragem de telefones, e-mails e links no read-path (`GET /chat/rooms/:id/messages`) e nas transmissões de websocket caso o status da candidatura não seja `APPROVED`.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Criação das tabelas `ChatRoom` e `Message` sem acoplamento de chaves estrangeiras externas ao módulo de chat.
- [chat.gateway.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/chat/chat.gateway.ts): [NEW] Gateway WebSocket isolado para relay de mensagens.
- [chat.controller.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/chat/chat.controller.ts): [NEW] Controller para listagem de histórico e iniciação de chat.
- [chat-security.provider.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/chat/chat-security.provider.ts): [NEW] Interface abstrata de validação de status de candidaturas.
- [ChatOverlay.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/components/ChatOverlay.tsx): [NEW] Componente autônomo de chat para o frontend.

## Verification
- Teste de integração verificando isolamento do módulo de chat e independência de imports de banco do módulo principal.
- Teste unitário da regex de mascaramento de contatos dinâmico.
