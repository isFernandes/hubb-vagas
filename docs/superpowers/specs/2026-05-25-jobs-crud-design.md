# Design Spec: 2.1 CRUD de vagas para empresa

## Visão Geral
Implementação dos endpoints e regras de negócios para a gestão de Vagas (Jobs) pelas Empresas no sistema Hubb-Vagas. O sistema utilizará autenticação JWT para identificação do autor, validação com Zod para entrada de dados e restrições de propriedade para garantir a segurança.

## Arquitetura e Componentes

### 1. Controller (`JobsController`)
- **POST `/jobs`**: Rota para criação de vaga. Extrai o `companyId` do token JWT (`req.user`) e injeta no corpo da requisição antes de repassar ao Service. 
- **PATCH `/jobs/:id`**: Rota para atualização. Pode ser usada para alterar dados gerais ou publicar uma vaga (mudança de `DRAFT` para `PUBLISHED`).
- **DELETE `/jobs/:id`**: Rota para remoção/arquivamento da vaga.
- **GET `/jobs` & GET `/jobs/:id`**: Já existentes, podem ser mantidos ou ajustados posteriormente para paginação (parte da task 2.2).
- Todas as rotas de mutação serão protegidas por `@UseGuards(JwtAuthGuard, RolesGuard)` com a `@Roles(Role.Company)`.

### 2. Validação de Dados (Zod)
- Será implementado um `ZodValidationPipe` genérico na aplicação caso não exista, para uso com os schemas Zod.
- **CreateJobSchema**: 
  - `title`: string (min 3)
  - `description`: string (min 10)
  - `requirements`: string (min 10)
  - `location`: string (min 2)
  - `contractType`: string
  - `expiresAt`: string (formato de data/ISO)
  - *Nota*: `status` e `companyId` NÃO vêm do body.
- **UpdateJobSchema**: Todos os campos do Create, porém transformados em opcionais (`.optional()`). Além disso, pode conter a atualização explícita do `status` (ex: `JobStatus` enum).

### 3. Service e Regras de Negócio (`JobsService`)
- **Criação**: O status inicial é sempre forçado no backend como `DRAFT`.
- **Autorização (Update e Delete)**: 
  - O método deve primeiro buscar a vaga pelo ID (`this.jobsRepository.findById`).
  - Se a vaga não existir: `NotFoundException`.
  - Se `job.companyId !== companyIdDoToken`: `ForbiddenException` ("Você não tem permissão para alterar esta vaga").
  - Somente após essa checagem a operação (update ou delete) é autorizada e repassada ao repositório.

## Modificações Futuras
- Foi decidido que a permissão de "bypass" para que `Admins` possam editar/deletar vagas de terceiros não será implementada agora. Essa melhoria será mapeada no arquivo `ToDo.MD` na seção "Improvements".