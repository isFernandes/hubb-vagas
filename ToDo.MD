# ToDo

## 1. Base do projeto e domínio

- [x] 1.1 Setup inicial do backend (NestJS ou framework escolhido) e configuração básica do projeto.
- [x] 1.2 Modelagem de domínio com entidades principais (account, company, user, job, application, job_status_history).
- [x] 1.3 Definição de papéis e autorização (company, user, admin).

## 2. Funcionalidades principais de vagas

- [x] 2.1 CRUD de vagas para empresa (criação, edição, publicação, mudança de status).
- [x] 2.2 Listagem de vagas para usuários user com filtros básicos.
- [x] 2.3 Fluxo de candidatura (criação de applications).
- [x] 2.4 Histórico de status de vaga (job_status_history).

## 3. Persistência em Postgres

- [x] 3.1 Configurar conexão com Postgres (local e/ou via RDS em dev/stage).
- [x] 3.2 Criar migrações para tabelas principais (accounts, companies, users, jobs, applications, job_status_history).
- [x] 3.3 Implementar repositórios/ORM para operações de leitura/escrita.

## 4. Redis: cache e lock distribuído

- [x] 4.1 Configurar acesso ao Redis/ElastiCache no projeto.
- [x] 4.2 Implementar cache de listagem de vagas publicadas (chaves `job:list:{filtersHash}` com TTL).
- [x] 4.3 Implementar cache de detalhe de vaga (`job:detail:{jobId}`).
- [x] 4.4 Implementar componente de lock distribuído baseado em SETNX + TTL com chave `job-lock:{jobId}`.
- [x] 4.5 Integrar o lock no fluxo de fechamento por contratação (uso pelos workers que processam ApplicationApproved).

## 5. RabbitMQ e processamento assíncrono

- [x] 5.1 Provisionar/Configurar RabbitMQ (localmente e, opcionalmente, em AWS via EC2/ECS ou serviço gerenciado).
- [x] 5.2 Criar publishers na API para eventos de domínio:
  - [x] 5.2.1 AccountCreated (criação assíncrona de perfis).
  - [x] 5.2.2 ApplicationCreated (quando candidato aplica à vaga).
  - [x] 5.2.3 ApplicationApproved (quando candidato é aprovado).
  - [x] 5.2.4 JobClosed (quando vaga é fechada por expiração ou contratação).
- [x] 5.3 Implementar Job Workers que consomem filas/exchanges:
  - [x] 5.3.1 Worker de perfis (AccountsConsumer) usando Strategy Pattern.
  - [x] 5.3.2 Worker de notificações (e-mail, webhooks) para ApplicationCreated e JobClosed.
  - [x] 5.3.3 Worker de fechamento de vaga para ApplicationApproved, usando lock em Redis e atualizando Postgres.

## 6. Infraestrutura AWS e Arquitetura (Concluído)

- [x] 6.1 Definir modelo de deployment da API (ECS Fargate ou EC2 atrás de ALB).
- [x] 6.2 Especificar/Desenhar uso de RDS PostgreSQL (mesmo que inicialmente seja apenas em dev local).
- [x] 6.3 Especificar/Desenhar uso de ElastiCache Redis para cache e lock distribuído.
- [x] 6.4 Especificar/Desenhar topologia de RabbitMQ (cluster em EC2/ECS).
- [x] 6.5 Especificar hosting do frontend (S3 + CloudFront).
- [x] 6.6 Documentar o projeto tecnicamente e com viés de negócios (`docs/ARCHITECTURE.md`).

## 7. Frontend

- [x] 7.1 Setup do frontend (framework SPA) com autenticação básica.
- [x] 7.2 Telas para empresa (publicar/gerenciar vagas, ver candidaturas).
- [x] 7.3 Telas para usuário user (listagem de vagas, detalhe, candidatura).

## 8. Segurança e observabilidade

- [x] 8.1 Implementar autenticação JWT / integração com IdP (ex.: Cognito).
- [x] 8.2 Garantir autorização por role em endpoints sensíveis.
- [x] 8.3 Configurar logs estruturados na API e nos workers.
- [x] 8.4 Definir métricas e alarmes principais (latência API, tamanho de filas RabbitMQ, erros em workers).

## 9. Testes Automatizados e Cobertura (Pendente)

- [x] 9.1 Set up Jest for backend unit/integration tests (Setup feito, mas cobertura muito baixa)
- [ ] 9.1.1 Atingir 80%+ de cobertura no Backend (Foco: Workers, Redis Lock, Notificações e Services)
- [x] 9.2 Configure Vitest and React Testing Library for the frontend
- [ ] 9.2.1 Atingir 80%+ de cobertura no Frontend (Testes RTL em Pages e Components)
- [ ] 9.3 Ensure `turbo run test` executes tests in both workspaces successfully (Gerando relatórios consolidados)
- [x] 9.4 Add GitHub Actions (or another CI) pipeline basic configuration
- [x] 9.5 Verify `npm run dev` starts correctly across the monorepo
- [x] 9.6 Verify `turbo run build` builds smoothly
- [x] 9.7 Verify `turbo run lint` executes successfully

## 10. Validação e Estabilidade (Pendente)

- [x] 10.1 Garantir testes end-to-end do fluxo (robô HTTP testou de ponta a ponta).
- [x] 10.2 Correção de bugs finais de rotas e validações Zod.
- [x] 10.3 Ajustes de UX (Toasts nativos do Sonner para validações falhas).

## 11. Monetização e Pagamentos (A Fazer)

- [ ] 11.1 Integrar gateway de pagamento (ex: Mercado Pago / Stripe) para transações na plataforma.
- [ ] 11.2 Suportar métodos: Cartão de Crédito, Cartão de Débito e PIX.
- [ ] 11.3 Construir interface de checkout para as empresas ou freelancers.

## 12. Segurança, UX e Refinamentos de Domínio (A Fazer)

- [x] 12.1 Incluir remuneração/valor (`paymentAmount`) nas vagas. (Muito Fácil - Apenas adicionar coluna e input)
- [x] 12.2 Validação de CPF para Candidatos. (Muito Fácil - Validação matemática no cadastro)
- [x] 12.3 Validação de CNPJ usando Brasil API. (Fácil - Chamada HTTP externa no backend)
- [x] 12.4 Feedback de Fechamento: E-mail para os não selecionados. (Fácil - Disparar evento no RabbitMQ)
- [x] 12.5 Painel de configurações (Settings) para edição de perfil, senha e bio. (Fácil/Médio - Nova tela e endpoint de PATCH)
- [ ] 12.6 Suporte a avatar/foto de perfil em base64. (Médio - Ajuste no Prisma e componente de upload no Front)
- [ ] 12.7 Vagas Múltiplas: Campo `positionsAvailable`. (Médio - Ajustar a lógica de fechamento da vaga por contagem)
- [ ] 12.8 Sistema de Reputação: Avaliações (1 a 5 estrelas). (Médio - Criação de novas tabelas e rotas pós-serviço)
- [ ] 12.9 Política de Cancelamento (No-Show) com punição. (Médio/Complexo - Lógica de desconto de estrelas baseado no tempo)
- [ ] 12.10 Validador de conflito de agenda (mín. 1h entre bicos). (Complexo - Checagem de cruzamento de horários em aplicações ativas)
- [ ] 12.11 Busca por geolocalização (Raio de atuação). (Muito Complexo - Conversão de endereço em Lat/Lng e buscas por distância - PostGIS/Haversine)

## 13. Administração e Governança (A Fazer)

- [x] 13.1 Painel de controle Web exclusivo para usuários com role Admin (Dashboard de Métricas).
- [x] 13.2 Listagem geral de usuários (Candidatos e Empresas) com paginação, busca e histórico.
- [x] 13.3 Funcionalidade de banimento/suspensão de usuários com Log de Auditoria (quem baniu, quando e motivo).
- [x] 13.4 Sistema de moderação de denúncias (Vagas falsas, no-show, assédio).
- [ ] 13.5 Gestão Financeira e Disputas (Acompanhar fluxo de caixa, taxas retidas e resolução de conflitos de pagamento).
- [x] 13.6 Configurações Globais do Sistema (Ajustar taxa da plataforma %, valor mínimo de vaga, etc., sem hardcode).
- [x] 13.7 Configurar e manter outros usuários admin e gerenciamento de acessos.

## 14. Algoritmos Avançados de Alocação (A Fazer)

- [ ] 14.1 Fila de Espera / Reservas: Permitir que candidatos fiquem como "standby" em vagas concorridas. Caso um aprovado desista (No-Show), o sistema automaticamente aciona o próximo da fila.

## Improvements (Melhorias Contínuas)

- [x] Permitir que usuários com role Admin possam contornar a restrição de propriedade da vaga no Update/Delete de Jobs.
- [ ] Chat interno na plataforma para ocultar contatos diretos até aprovação final (Improvement Futuro).
