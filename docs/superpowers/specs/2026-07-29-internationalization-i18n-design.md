# Design Spec: Improvement 5.2 - Internacionalização (i18n)

## Goal
Implementar suporte multilíngue (Português/Inglês) na interface do usuário e nos e-mails transacionais enviados pelo backend, permitindo a internacionalização completa do sistema.

## Architecture
1. **Banco de Dados (Prisma):**
   - Adicionar o campo `language String @default("pt")` no modelo `Account` para rastrear o idioma preferido do usuário.
2. **Frontend Multi-idiomas (React):**
   - Utilizar as bibliotecas `i18next` e `react-i18next`.
   - Detecção automática do idioma baseado no navegador (`navigator.language`) com fallback para `pt`.
   - Armazenar preferência manual no `localStorage`.
   - Incluir seletor de idioma (dropdown) no topo (Header) das páginas.
3. **Backend Multi-idiomas (NestJS Mailer):**
   - Estruturar arquivos de tradução `pt.json` e `en.json` sob a pasta `apps/api/src/infra/i18n/`.
   - Modificar o `MailerService` para carregar as chaves de tradução apropriadas do JSON com base no campo `Account.language` do destinatário antes de renderizar os templates Handlebars.

## Proposed Changes
- [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/infra/prisma/schema.prisma): Adicionar propriedade `language` ao modelo `Account`.
- [i18n.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/i18n.ts): [NEW] Arquivo de inicialização do i18next no frontend.
- [translation.json](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/public/locales/pt/translation.json): [NEW] Recursos de tradução em Português.
- [translation.json](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/public/locales/en/translation.json): [NEW] Recursos de tradução em Inglês.
- [Header.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/components/Header.tsx): Seletor de idioma interativo no layout principal.
- [mailer.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/api/src/notifications/mailer.service.ts): Tradução dinâmica de e-mails transacionais de acordo com a conta do destinatário.

## Verification
- Teste unitário para validar carregamento correto de chaves de e-mail nos idiomas "en" e "pt".
- Teste de interface simulando a persistência do idioma selecionado no localStorage.
