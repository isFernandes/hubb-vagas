# Design Spec: Improvement 6.5 - Observabilidade Frontend com PostHog

## Goal
Implementar monitoramento visual (Session Replays), métricas de performance (Web Vitals) e rastreamento de erros no frontend React utilizando o PostHog (plano gratuito cloud).

## Architecture
1. **Instalação e Setup:**
   - Instalação da biblioteca leve `posthog-js`.
   - Inicialização do SDK no bootstrap da aplicação frontend (`main.tsx`).
   - Leitura de chaves públicas via variáveis de ambiente `VITE_POSTHOG_KEY` e `VITE_POSTHOG_HOST` (evitando carregamento caso as variáveis estejam ausentes no ambiente local).
2. **Session Replays & Mapeamento:**
   - Mapear a navegação do usuário de ponta a ponta de forma visual (gravação de cliques, inputs de texto com dados confidenciais mascarados por padrão e erros de console).
   - Identificar o usuário por ID (`posthog.identify`) logo após a validação do login para facilitar a pesquisa e auditoria de incidentes de usabilidade ou erros técnicos por usuário.
   - Limpar dados de sessão (`posthog.reset`) no ato do logout.

## Proposed Changes
- [package.json](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/package.json): Adicionar dependência `posthog-js`.
- [main.tsx](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/main.tsx): Inicialização global do SDK do PostHog.
- [auth.service.ts](file:///C:/Users/User/Desktop/projects/hubb-vagas/apps/web/src/services/auth.ts) (ou hook de autenticação correspondente): Chamar `posthog.identify` e `posthog.reset` nos fluxos de controle de sessão.

## Verification
- Teste manual validando que o script inicializa sem erros na ausência das chaves no `.env`.
- Verificar o envio de eventos e gravação de sessão no console do PostHog em ambiente de homologação.
