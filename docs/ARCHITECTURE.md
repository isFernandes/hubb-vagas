# Hubb Vagas - Documentação de Arquitetura e Negócios

Bem-vindo à documentação oficial do **Hubb Vagas**, uma plataforma moderna projetada para conectar talentos de tecnologia às melhores oportunidades do mercado.

---

## 1. Visão de Negócios (Business View)

O **Hubb Vagas** nasceu da necessidade de modernizar e otimizar o fluxo de recrutamento.
A plataforma serve a duas personas principais:
1. **Empresas (Company)**: Buscam uma plataforma ágil para postar vagas, analisar candidatos em tempo real e gerenciar o ciclo de vida da contratação de forma automatizada e sem fricções.
2. **Candidatos (User)**: Buscam uma interface premium, minimalista (Dark Mode & Mobile First) e rápida para encontrar vagas que casam com seu perfil e realizar candidaturas (applications) com um único clique.

**Diferenciais e Regras de Negócio Chave**:
- O ciclo de vida da vaga é rastreável e gerenciado por uma máquina de estados (`DRAFT` -> `PUBLISHED` -> `CLOSED`).
- A contratação de um candidato aciona o fechamento automático da vaga de forma segura e consistente para evitar duplas contratações (garantido através de Locks Distribuídos).
- A comunicação com os usuários e empresas ocorre de forma assíncrona, garantindo resiliência e tempos de resposta baixíssimos no portal.

---

## 2. Visão Arquitetural e Tecnológica

O sistema foi desenhado com o conceito de **Monorepo** (gerenciado via [Turborepo](https://turbo.build/)), provendo um compartilhamento ágil e ferramentas de build unificadas, respeitando boas práticas de Clean Architecture no backend.

### 2.1 Stack Tecnológica
- **Frontend (Web)**: Vite + React 19 + TypeScript. UI minimalista usando Tailwind CSS (v4) e [Shadcn UI](https://ui.shadcn.com/) para componentização de alto nível. Testes via Vitest e Testing Library.
- **Backend (API)**: [NestJS](https://nestjs.com/) framework utilizando TypeScript. Orientado a módulos e repositórios. Testes robustos via Jest.
- **Banco de Dados Relacional**: PostgreSQL, gerenciado de ponta a ponta pelo [Prisma ORM](https://www.prisma.io/).
- **Mensageria / Event-Driven**: RabbitMQ.
- **Cache & Distribuição de Lock**: Redis.

### 2.2 Domain-Driven Design (Core)
O sistema foca em domínios isolados implementados como módulos no NestJS:
- **Accounts**: Gerenciamento base de credenciais, senhas encriptadas com Bcrypt e delegação de Roles.
- **Users / Companies**: Extensão do Account base, guardando os perfis específicos (Candidato vs Empresa).
- **Jobs**: Gestão das vagas. Controla a publicação e mantém um `JobStatusHistory` imutável.
- **Applications**: Candidaturas às vagas.

---

## 3. Desenho de Infraestrutura em Cloud (AWS)

Para suportar alta escalabilidade e disponibilidade, a arquitetura produtiva na AWS (Fase 6) é definida conforme abaixo:

### 3.1 Frontend Delivery
- **Hosting**: Os artefatos compilados do frontend (Vite/React) são armazenados em um bucket **Amazon S3** (`Static Website Hosting`).
- **CDN**: Servido globalmente via **Amazon CloudFront**, garantindo baixíssima latência na entrega dos assets estáticos (CSS, JS, Fontes) e proteção via WAF básico.

### 3.2 Backend API & Compute
- **Containers**: A API NestJS é conteinerizada via Docker.
- **Orquestração**: Utiliza-se **Amazon ECS (Elastic Container Service)** rodando no modo **Fargate** (Serverless Compute), evitando gerenciamento de instâncias EC2 e permitindo auto-scaling dinâmico baseado em uso de CPU/Memória.
- **Load Balancing**: Um **Application Load Balancer (ALB)** distribui o tráfego HTTPS originário da Internet para as tasks Fargate, além de fazer o offloading do certificado SSL.

### 3.3 Banco de Dados (Database Tier)
- **PostgreSQL**: Rodando como **Amazon RDS for PostgreSQL**.
- **Resiliência**: Configurado em modo `Multi-AZ` (Múltiplas Zonas de Disponibilidade) para garantir failover automático em caso de falha física no Data Center, assegurando durabilidade e consistência (ACID) das entidades críticas.

### 3.4 Caching e Locks Distribuídos
- **Redis**: Hospedado via **Amazon ElastiCache for Redis**.
- **Propósito**:
  1. Caching de listagens e acessos intensos da plataforma.
  2. Gerenciamento do `Distributed Lock` (`SETNX`). Fundamental durante o fechamento de uma vaga (onde múltiplos workers podem ser acionados quase simultaneamente), garantindo que operações no PostgreSQL não sofram condição de corrida.

### 3.5 Mensageria e Event-Driven Architecture (Worker Tier)
- **Broker**: Utiliza-se **Amazon MQ (for RabbitMQ)** ou um Cluster RabbitMQ rodando no EC2 (dependendo do orçamento do projeto).
- **Consumidores**: Outros micro-serviços ou Tasks separadas no ECS Fargate ficam escutando as filas (ex: envio de e-mails em background via *Amazon SES* quando ocorre um `ApplicationCreated` ou processamento de contratação via `ApplicationApproved`).

### 3.6 Arquitetura Lógica (AWS Topology)
```text
[Usuários / Candidatos / Empresas]
           |
      (Internet / DNS Route 53)
           |
      +----+----+
      |  Cloud  | ---> Serve Estáticos (S3 + CloudFront)
      |  Front  |
      +----+----+
           |
           v
    [ ALB - HTTPS ]
           |
  +--------+--------+
  |    ECS Fargate  | (Múltiplas Instâncias da API NestJS)
  +--------+--------+
      |    |    |
      |    |    +---> [ Amazon MQ / RabbitMQ ] ---> [ ECS Workers (Envio de Email / Async) ]
      |    |
      |    +--------> [ Amazon ElastiCache (Redis) ] (Lock Distribuído & Cache)
      |
      +-------------> [ Amazon RDS (PostgreSQL) ] (Multi-AZ)
```

---

## 4. Workflows Assíncronos em Destaque

**A. Aplicação a uma Vaga (ApplicationCreated)**
1. O usuário clica em "Candidatar-se".
2. O Backend valida o status e insere em `Applications` (Postgres).
3. Publica na fila `ApplicationCreated`.
4. A API retorna rapidamente para o usuário. Em background, o Worker dispara as boas-vindas.

**B. Contratação e Lock Distribuído (ApplicationApproved)**
1. O Worker consome o evento de que um candidato foi aprovado.
2. Tenta adquirir Lock no **Redis** (`job-lock:{jobId}`) com TTL de X segundos.
3. Se garantido: valida no Postgres se o Job ainda está aberto. Atualiza pra `CLOSED_HIRED` (prevenindo double-booking). Libera o lock. Invalida cache de paginação do Redis.
4. Se o Lock não foi garantido, um outro worker já está lidando com aquela vaga, o sistema não faz nada e evita a colisão.

---
*Hubb Vagas - Arquitetura, Regras e Design orientados à escalabilidade, robustez e elegância.*
