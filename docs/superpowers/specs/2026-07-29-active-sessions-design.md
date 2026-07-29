# Design Spec: Improvement 1.2 - Controle de Sessões Ativas

## Goal
Implementar um painel de gerenciamento de segurança onde os usuários possam visualizar suas sessões ativas (IP, navegador/sistema operacional e data de login) e revogar conexões JWT remotamente usando o Redis como barreira de autorização.

## Architecture
1. **Modelagem & Armazenamento:**
   - As sessões são salvas em memória no Redis sob chaves `user:sessions:{userId}:{jti}` no ato do login.
   - O JWT conterá uma claim única `jti` (UUID).
2. **Validação (JwtAuthGuard):**
   - O guard de autenticação de rotas intercepta a requisição e verifica no Redis se a chave do `jti` associado ainda existe. Caso não exista (revogada ou expirada), a requisição é rejeitada com status 401.
3. **Gerenciamento:**
   - Rota `GET /auth/sessions` retorna todas as sessões registradas no Redis para o usuário logado.
   - Rota `DELETE /auth/sessions/:jti` exclui a chave do Redis, revogando o acesso do dispositivo alvo instantaneamente.
   - Alterações de senha limpam automaticamente todas as sessões ativas do usuário do Redis por motivos de compliance de segurança.

## Proposed Changes
- [auth.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/auth/auth.service.ts): Inserir criação de `jti` e gravação no Redis no fluxo de login.
- [jwt-auth.guard.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/guards/jwt-auth.guard.ts): Adicionar verificação de chave Redis.
- [sessions.controller.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/auth/sessions.controller.ts): [NEW] Expor listagem e revogação de chaves Redis.
- [Settings.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/pages/candidate/Settings.tsx): Painel de gerenciamento de sessões com ações de revogação.

## Verification
- Teste unitário certificando bloqueio do JwtAuthGuard caso a chave no Redis seja removida.
- Teste de integração de exclusão múltipla de chaves ao alterar senha do perfil.
