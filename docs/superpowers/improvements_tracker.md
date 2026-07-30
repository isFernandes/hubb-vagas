# Improvements Tracker: Melhorias Contínuas

Este tracker gerencia a execução e o progresso das melhorias contínuas planejadas para a plataforma **Hubb Vagas**. A ordem das tarefas foi priorizada utilizando o conceito de **WSJF (Weighted Shortest Job First)** (Custo de Atraso vs. Tamanho/Complexidade do Trabalho), posicionando os itens de menor esforço e maior entrega de valor no topo, mantendo a numeração original das tarefas e respeitando as restrições informadas.

---

## 📋 Lista de Tarefas Priorizada (WSJF)

### 🟢 Fase 1: Quick Wins & Valor Imediato (Maior WSJF)

- [ ] **[1] Melhoria 1.1: Worker de Exclusão (LGPD)**
  - *Descrição:* Fluxo de exclusão e anonimização de perfil e dados pessoais sob demanda.
  - *Design Spec:* [2026-07-29-lgpd-deletion-worker-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-lgpd-deletion-worker-design.md)
  - *Plano:* [2026-07-29-lgpd-deletion-worker.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-lgpd-deletion-worker.md)
  - *Dependências:* Nenhuma.

- [ ] **[2] Melhoria 6.5: Observabilidade Frontend (PostHog)**
  - *Descrição:* Captura de Session Replays, erros de console e Web Vitals com plano gratuito.
  - *Design Spec:* [2026-07-29-posthog-observability-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-posthog-observability-design.md)
  - *Plano:* [2026-07-29-posthog-observability.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-posthog-observability.md)
  - *Dependências:* Nenhuma.

- [ ] **[3] Melhoria 2.1: Motor de Matching (Matching Engine)**
  - *Descrição:* Algoritmo composto de afinidade com base em setor, reputação, localidade e texto.
  - *Design Spec:* [2026-07-29-matching-engine-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-matching-engine-design.md)
  - *Plano:* [2026-07-29-matching-engine.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-matching-engine.md)
  - *Dependências:* Nenhuma.

- [ ] **[4] Melhoria 5.1: Planos de Assinatura (SaaS)**
  - *Descrição:* Monetização recorrente limitando contas grátis a 2 vagas ativas simultâneas.
  - *Design Spec:* [2026-07-29-subscriptions-saas-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-subscriptions-saas-design.md)
  - *Plano:* [2026-07-29-subscriptions-saas.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-subscriptions-saas.md)
  - *Dependências:* Nenhuma.

- [ ] **[5] Melhoria 3.2: Notificações Multicanal (WhatsApp/Push)**
  - *Descrição:* Notificações ativas via SMS/WhatsApp (API Genérica) e Web Push nativo VAPID.
  - *Design Spec:* [2026-07-29-multichannel-notifications-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-multichannel-notifications-design.md)
  - *Plano:* [2026-07-29-multichannel-notifications.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-multichannel-notifications.md)
  - *Dependências:* Nenhuma.

---

### 🟡 Fase 2: Experiência de Recrutamento & Fluxos de Trabalho (Médio WSJF)

- [ ] **[6] Melhoria 4.2: Funil de Contratação (Kanban) Board**
  - *Descrição:* Quadro visual interativo para controle de triagem integrado a checkout.
  - *Design Spec:* [2026-07-29-kanban-funnel-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-kanban-funnel-design.md)
  - *Plano:* [2026-07-29-kanban-funnel.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-kanban-funnel.md)
  - *Dependências:* Nenhuma (Aproveita enums existentes).

- [ ] **[7] Melhoria 3.1: Chat Interno**
  - *Descrição:* Chat WebSocket desacoplado com filtros regex dinâmicos de dados de contato.
  - *Design Spec:* [2026-07-29-internal-chat-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-internal-chat-design.md)
  - *Plano:* [2026-07-29-internal-chat.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-internal-chat.md)
  - *Dependências:* Recomenda-se implementar após Notificações Multicanal para alertas de mensagens offline.

- [ ] **[8] Melhoria 1.2: Controle de Sessões Ativas**
  - *Descrição:* Gestão e revogação de tokens JWT ativas utilizando cache Redis.
  - *Design Spec:* [2026-07-29-active-sessions-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-active-sessions-design.md)
  - *Plano:* [2026-07-29-active-sessions.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-active-sessions.md)
  - *Dependências:* Nenhuma.

---

### 🔵 Fase 3: SRE, Monitoramento & Administração (Segurança & Métricas)

- [ ] **[9] Melhoria 6.4: Monitoramento Sintético e Alertas**
  - *Descrição:* Script externo de request com envios ricos de incidentes para Webhook do Slack.
  - *Design Spec:* [2026-07-29-synthetic-monitoring-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-synthetic-monitoring-design.md)
  - *Plano:* [2026-07-29-synthetic-monitoring.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-synthetic-monitoring.md)
  - *Dependências:* Recomenda-se implementar após Status Page Pública (usa endpoint `/health`).

- [ ] **[10] Melhoria 6.1: OpenTelemetry (APM) Tracing**
  - *Descrição:* Instrumentação de traces HTTP/PG/Redis/RabbitMQ com Jaeger.
  - *Design Spec:* [2026-07-29-opentelemetry-apm-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-opentelemetry-apm-design.md)
  - *Plano:* [2026-07-29-opentelemetry-apm.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-opentelemetry-apm.md)
  - *Dependências:* Nenhuma.

- [ ] **[11] Melhoria 6.2: Status Page Pública**
  - *Descrição:* Endpoint `/health` com cache de 30s e tela pública de status de infraestrutura.
  - *Design Spec:* [2026-07-29-status-page-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-status-page-design.md)
  - *Plano:* [2026-07-29-status-page.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-status-page.md)
  - *Dependências:* Nenhuma.

- [ ] **[12] Melhoria 6.3: Métricas em Tempo Real (Prometheus/Grafana)**
  - *Descrição:* Exposição de estatísticas do prom-client protegidas sob Basic Auth no endpoint `/metrics`.
  - *Design Spec:* [2026-07-29-realtime-metrics-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-realtime-metrics-design.md)
  - *Plano:* [2026-07-29-realtime-metrics.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-realtime-metrics.md)
  - *Dependências:* Nenhuma.

- [ ] **[13] Melhoria 4.3: Analytics de Recrutamento**
  - *Descrição:* KPI de Time-to-Hire ponderado por vaga, taxas de conversão e exportação de CSV.
  - *Design Spec:* [2026-07-29-recruitment-analytics-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-recruitment-analytics-design.md)
  - *Plano:* [2026-07-29-recruitment-analytics.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-recruitment-analytics.md)
  - *Dependências:* Depende da finalização do suporte a Vagas Múltiplas (Item 12.7) para cálculo correto de posições.

- [ ] **[14] Melhoria 5.2: Internacionalização (i18n)**
  - *Descrição:* Suporte multilíngue PT/EN no client React e templates de e-mail do backend.
  - *Design Spec:* [2026-07-29-internationalization-i18n-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-internationalization-i18n-design.md)
  - *Plano:* [2026-07-29-internationalization-i18n.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-internationalization-i18n.md)
  - *Dependências:* Recomenda-se fazer após as demais melhorias para traduzir telas consolidadas.

---

### 🔴 Fase 4: Prioridades Menores (Baixo WSJF / Conforme Solicitado)

- [ ] **[15] Melhoria 2.2: Assessments e Quizzes**
  - *Descrição:* Perguntas de triagem rápidas (máximo 4) exibidas no card do candidato.
  - *Design Spec:* [2026-07-29-assessments-quizzes-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-assessments-quizzes-design.md)
  - *Plano:* [2026-07-29-assessments-quizzes.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-assessments-quizzes.md)
  - *Dependência:* Nenhuma. *Classificado como 2º menos importante.*

- [ ] **[16] Melhoria 3.3: Agendamento do Bico no Calendário (Google Calendar)**
  - *Descrição:* Criação e atualização automática de eventos no Google Calendar com horários do bico.
  - *Design Spec:* [2026-07-29-job-calendar-scheduling-design.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/specs/2026-07-29-job-calendar-scheduling-design.md)
  - *Plano:* [2026-07-29-job-calendar-scheduling.md](file:///C:/Users/User/Desktop/projects/hubb-vagas/docs/superpowers/plans/2026-07-29-job-calendar-scheduling.md)
  - *Dependência:* Nenhuma. *Classificado como o menos importante de todos.*
