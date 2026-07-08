# Plano de Ação: Correção da Cobertura de Testes (Item 9)

**Contexto:** Apesar do setup das ferramentas de teste (Jest, Vitest) estar feito e testes End-to-End básicos estarem implementados nos controllers novos (como o Settings), a cobertura de testes atual do projeto nas funcionalidades core está severamente defasada.

## 📊 Estado Atual da Cobertura (Backend)
- **Mensageria & Workers (RabbitMQ):** 0%
- **Redis (Cache & Lock Distribuído):** 0%
- **Repositórios do Prisma:** 0%
- **Serviço de Notificações (E-mail):** 0%
- **Fluxos Core (Vagas e Usuários):** ~45% - 65%

## 📊 Estado Atual da Cobertura (Frontend)
- **Componentes React / Pages:** 0% reais (Apenas renderização vazia em `App.test.tsx`).

---

## 🚀 Plano de Execução (Sprints de Teste)

### Fase 1: Infraestrutura e Serviços Core (Backend)
**Objetivo:** Garantir que os sistemas auxiliares e repositórios não quebrem silenciosamente.
1. **Prisma Repositories:** Criar testes unitários (fazendo mock do PrismaClient) para as classes em `src/infra/prisma/prisma-repository`.
2. **Lock Service (Redis):** Escrever testes para `lock.service.ts` mockando a biblioteca do Redis para verificar os comportamentos de `acquire` e `release`.
3. **Módulo de Notificações:** Testar o envio de e-mails (`notifications.consumer.ts`) simulando o NodeMailer/SES.

### Fase 2: Regras de Negócio, Validações e Workers (Backend)
**Objetivo:** Cobrir as regras da aplicação que costumam dar dor de cabeça em produção.
1. **Validações e Casos de Falha:**
   - Adicionar testes pro controller de `Accounts` forçando a falha de validação da Brasil API (CNPJ).
   - Testar o comportamento do ZodPipe nas requisições sem `paymentAmount` ou `cpf` válido.
2. **Job Closure Worker:** Testar `job-closure.worker.ts` verificando:
   - Sucesso no fluxo completo (candidato aprovado -> lock adquirido -> Postgres atualizado).
   - Comportamento ao falhar em adquirir o lock (condição de corrida).

### Fase 3: Controllers e Services Restantes (Backend)
**Objetivo:** Elevar `users.service.ts` e `jobs.service.ts` para >80%.
1. **JobsService / JobsController:** Cobrir as permissões de acesso (Company só dita as próprias vagas, etc) e criação correta das `applications`.
2. **AccountsService:** Garantir cobertura total da criptografia de senha e retornos de conflito (409).

### Fase 4: Integração de Testes no Frontend (Vitest + RTL)
**Objetivo:** Começar a cobertura das lógicas de tela.
1. **Componentes Isolados:** Testar os componentes menores de UI, se existirem (ex: botões, inputs configurados).
2. **Formulários e Mutações:** 
   - Adicionar testes às páginas `CandidateSettings` e `CompanySettings`, mockando o Axios (`api`) para validar o preenchimento de inputs e chamadas à API.
   - Testar navegação autenticada no `AppRoutes` (PrivateRoutes redirecionando quem não está logado).

### Fase 5: CI/CD Pipeline
**Objetivo:** Impor a cultura para não repetir o erro.
1. Atualizar o arquivo do GitHub Actions para falhar o build (ou o PR) caso o comando `turbo run test:cov` resulte em cobertura inferior a 80%.
