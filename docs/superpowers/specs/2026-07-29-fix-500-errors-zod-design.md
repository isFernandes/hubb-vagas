# Fix 500 Internal Server Errors via Zod and Prisma Cascading Creation

## 1. Overview
The API currently throws `500 Internal Server Error` during the creation and updating of core entities (`Account`, `User`, `Company`). This happens because the repositories blindly pass unvalidated payloads to Prisma, leading to `PrismaClientValidationError` when required relational data is missing. 

To solve this, we will introduce a strict validation layer using **Zod** and refactor the repository operations to perform **Nested Writes (Cascading)** via the Prisma Client.

## 2. Architecture Changes

### 2.1 Validation Layer (Zod)
- **Library:** We will install `zod` and integrate it into NestJS to validate DTOs on incoming HTTP requests.
- **ZodValidationPipe:** A custom global or controller-scoped Pipe will be created/used to intercept and validate requests against Zod schemas.
- **Behavior:** Invalid requests will immediately return a `400 Bad Request` with structured validation errors, preventing malformed data from ever reaching the Services or Repositories.

### 2.2 Data Layer (Cascading Writes)
- **Single Source of Truth for Creation:** The creation of user/company profiles cannot happen independently of an `Account`. The controllers will be refactored to orchestrate atomic creation.
- **Prisma Nested Writes:** The `AccountsService` and Repositories will use Prisma's `create` nested writes to insert the `Account` and the corresponding `User` or `Company` profile in a single database transaction. 
- **Updating Profiles:** PATCH operations on `/users/:id` and `/companies/:id` will also be wrapped with Zod validation to ensure only valid fields are sent to Prisma.

## 3. Implementation Details

1. **Install Dependencies:**
   - `zod`
   - Integration bindings (e.g., a custom Pipe that leverages `schema.parse()`).

2. **Define Zod Schemas:**
   - `CreateUserRegistrationSchema`: Validates email, password, name, cpf, etc.
   - `CreateCompanyRegistrationSchema`: Validates email, password, company name, cnpj, etc.
   - `UpdateUserProfileSchema` / `UpdateCompanyProfileSchema`: Makes fields optional but strictly typed.

3. **Refactor Repositories and Services:**
   - **AccountsRepository:** Add a method for cascading user/company creation.
   - **UsersController & CompaniesController (or Auth/Accounts):** Bind the Zod pipe to the POST routes. Change the service invocation to pass the validated payload to the centralized creation flow.

## 4. Scope & Dependencies
- **Scope:** This design is isolated to resolving the `500 Internal Server Errors` identified in the error catalog for the `POST /accounts`, `POST /users`, `POST /companies` and their respective `PATCH` routes.
- **Dependencies:** Requires the NestJS application context to correctly register the global/scoped ZodValidationPipe.

## 5. Success Criteria
- Executing `curl` with invalid payloads against `POST /users` or `POST /companies` must return `400 Bad Request` with explicit Zod error messages.
- Executing `curl` with valid payloads must successfully create the `Account` and `Profile` in the database returning `201 Created` without orphan rows.
- No `500 Internal Server Error` should be triggered by missing relational payload fields.
