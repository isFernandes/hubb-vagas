# Design Spec: Job Listing Filters, Applications and Status History

Este documento especifica o design técnico para a listagem filtrada de vagas, fluxo de candidaturas (applications) e histórico de status de vagas (job_status_history).

## 1. Modificações no Schema (Prisma)

Adicionaremos a tabela `job_status_history` e as relações necessárias no [schema.prisma](file:///C:/Users/User/Desktop/projects/hubb-vagas/src/infra/prisma/schema.prisma):

```prisma
model JobStatusHistory {
  id           String    @id @default(uuid())
  jobId        String
  job          Job       @relation(fields: [jobId], references: [id])
  status       JobStatus
  changedById  String
  changedBy    Account   @relation(fields: [changedById], references: [id])
  reason       String?
  createdAt    DateTime  @default(now())

  @@map("job_status_history")
}
```

Atualizações nos modelos existentes:
- `Job`: adicionará a relação `statusHistory JobStatusHistory[]`.
- `Account`: adicionará a relação `jobStatusHistories JobStatusHistory[]`.

---

## 2. Endpoints e Fluxos de Dados

### 2.1 Listagem de Vagas (`GET /jobs`)
- **Acesso**: Público.
- **Filtros (Query Params)**:
  - `location` (opcional): Filtro case-insensitive parcial.
  - `contractType` (opcional): Filtro exato.
  - `companyId` (opcional): Filtro exato.
  - `search` (opcional): Busca case-insensitive nos campos `title` e `description`.
- **Regra de Visibilidade**:
  - Para usuários com role `User` ou visitantes anônimos, listar apenas vagas com status `PUBLISHED`.
  - Para fins de administração ou proprietários, pode-se futuramente expor outras vagas (neste momento, o padrão do endpoint `/jobs` para candidatos listará apenas as `PUBLISHED`).

### 2.2 Candidatura a Vaga (`POST /applications`)
- **Acesso**: Autenticado (apenas role `User`).
- **DTO de entrada**: `{ "jobId": string }`
- **Fluxo**:
  1. Busca a vaga pelo `jobId`. Se não encontrar, retorna `404 Not Found`.
  2. Valida se a vaga está com status `PUBLISHED`. Se não, retorna `400 Bad Request`.
  3. Busca o perfil de candidato (`User`) associado à conta autenticada (`req.user.id`). Se não existir, retorna `400 Bad Request`.
  4. Verifica se o candidato já se candidatou à vaga (duplicidade). Se sim, retorna `400 Bad Request`.
  5. Cria o registro de `Application` no banco.

---

## 3. Repositórios e Módulos

### 3.1 Módulo de Candidatura (`ApplicationsModule`)
Criaremos o módulo em `src/applications/` contendo:
- `applications.controller.ts`: Endpoint `POST /applications`.
- `applications.service.ts`: Lógica de validação e criação.
- `applications.repository.ts` (Interface abstrata) em `src/repositories/`.
- `prisma-applications.repository.ts` (Implementação Prisma) em `src/infra/prisma/prisma-repository/`.

### 3.2 Histórico de Status da Vaga (`JobStatusHistory`)
Criaremos em `src/repositories/` e `src/infra/prisma/prisma-repository/`:
- `job-status-history.repository.ts` (Interface abstrata).
- `prisma-job-status-history.repository.ts` (Implementação Prisma).
- Integração no `JobsService`:
  - No `create()`, registra a transição inicial para `DRAFT`.
  - No `update()`, se o `status` no payload de atualização for diferente do atual no banco, registra uma nova entrada de histórico com o `changedById`.

---

## 4. Testes e Validação de Sucesso

- **Testes Unitários**:
  - `JobsService` testando a filtragem e gravação de histórico de status.
  - `ApplicationsService` testando todas as regras de validação (vaga inexistente, vaga não publicada, candidato sem perfil, duplicidade de candidatura).
- **Validação de Prontidão**:
  - `npm run test` (todos os testes passando).
  - `npm run lint` (sem erros de lint).
  - `npm run build` (build do projeto com sucesso).
