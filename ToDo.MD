# ToDo

## 1. Base do projeto e domínio

- [x] 1.1 Setup inicial do backend (NestJS ou framework escolhido) e configuração básica do projeto.
- [x] 1.2 Modelagem de domínio com entidades principais (account, company, user, job, application, job_status_history).
- [x] 1.3 Definição de papéis e autorização (company, user, admin).

## 2. Funcionalidades principais de vagas

- [ ] 2.1 CRUD de vagas para empresa (criação, edição, publicação, mudança de status).
- [ ] 2.2 Listagem de vagas para usuários user com filtros básicos.
- [ ] 2.3 Fluxo de candidatura (criação de applications).
- [ ] 2.4 Histórico de status de vaga (job_status_history).

## 3. Persistência em Postgres

- [x] 3.1 Configurar conexão com Postgres (local e/ou via RDS em dev/stage).
- [x] 3.2 Criar migrações para tabelas principais (accounts, companies, users, jobs, applications, job_status_history).
- [x] 3.3 Implementar repositórios/ORM para operações de leitura/escrita.

## 4. Redis: cache e lock distribuído

- [ ] 4.1 Configurar acesso ao Redis/ElastiCache no projeto.
- [ ] 4.2 Implementar cache de listagem de vagas publicadas (chaves `job:list:{filtersHash}` com TTL).
- [ ] 4.3 Implementar cache de detalhe de vaga (`job:detail:{jobId}`).
- [ ] 4.4 Implementar componente de lock distribuído baseado em SETNX + TTL com chave `job-lock:{jobId}`.
- [ ] 4.5 Integrar o lock no fluxo de fechamento por contratação (uso pelos workers que processam ApplicationApproved).

## 5. RabbitMQ e processamento assíncrono

- [x] 5.1 Provisionar/Configurar RabbitMQ (localmente e, opcionalmente, em AWS via EC2/ECS ou serviço gerenciado).
- [x] 5.2 Criar publishers na API para eventos de domínio:
  - [x] 5.2.1 AccountCreated (criação assíncrona de perfis).
  - [ ] 5.2.2 ApplicationCreated (quando candidato aplica à vaga).
  - [ ] 5.2.3 ApplicationApproved (quando candidato é aprovado).
  - [ ] 5.2.4 JobClosed (quando vaga é fechada por expiração ou contratação).
- [ ] 5.3 Implementar Job Workers que consomem filas/exchanges:
  - [x] 5.3.1 Worker de perfis (AccountsConsumer) usando Strategy Pattern.
  - [ ] 5.3.2 Worker de notificações (e-mail, webhooks) para ApplicationCreated e JobClosed.
  - [ ] 5.3.3 Worker de fechamento de vaga para ApplicationApproved, usando lock em Redis e atualizando Postgres.

## 6. Infraestrutura AWS (foco em estudo)

- [ ] 6.1 Definir modelo de deployment da API (ECS Fargate ou EC2 atrás de ALB).
- [ ] 6.2 Especificar/Desenhar uso de RDS PostgreSQL (mesmo que inicialmente seja apenas em dev local).
- [ ] 6.3 Especificar/Desenhar uso de ElastiCache Redis para cache e lock distribuído.
- [ ] 6.4 Especificar/Desenhar topologia de RabbitMQ (cluster em EC2/ECS).
- [ ] 6.5 Especificar hosting do frontend (S3 + CloudFront).

## 7. Frontend

- [ ] 7.1 Setup do frontend (framework SPA) com autenticação básica.
- [ ] 7.2 Telas para empresa (publicar/gerenciar vagas, ver candidaturas).
- [ ] 7.3 Telas para usuário user (listagem de vagas, detalhe, candidatura).

## 8. Segurança e observabilidade

- [x] 8.1 Implementar autenticação JWT / integração com IdP (ex.: Cognito).
- [x] 8.2 Garantir autorização por role em endpoints sensíveis.
- [ ] 8.3 Configurar logs estruturados na API e nos workers.
- [ ] 8.4 Definir métricas e alarmes principais (latência API, tamanho de filas RabbitMQ, erros em workers).
