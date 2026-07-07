# Settings Panel Design (Item 12.5)

## Overview
This document specifies the technical design for the Settings Panel (Painel de Configurações) to allow users to edit their profile (bio, name, CPF/CNPJ) and password.

## Future-proofing Note
The schema currently supports an `Account` having both a `User` profile and a `Company` profile. While the `role` enum in the `Account` table currently restricts accounts to a single active role, the endpoints designed here are separated by domain (`/users/me` and `/companies/me`). This means if the system evolves to allow users to switch between candidate and company contexts under the same account, this architecture will seamlessly support it without endpoint modifications.

## Backend (API Endpoints)
Three new endpoints will be created to keep concerns separated and validation straightforward:

1. `PATCH /users/me`
   - **Auth**: Requires JWT, must have `User` role.
   - **Body**: `name` (optional), `cpf` (optional), `bio` (optional).
   - **Action**: Updates the `User` record associated with the authenticated account.

2. `PATCH /companies/me`
   - **Auth**: Requires JWT, must have `Company` role.
   - **Body**: `name` (optional), `cnpj` (optional), `contact` (optional).
   - **Action**: Updates the `Company` record associated with the authenticated account.

3. `PATCH /accounts/me/password`
   - **Auth**: Requires JWT (Any role).
   - **Body**: `currentPassword` (required), `newPassword` (required).
   - **Action**: Validates the current password. If correct, hashes and updates to the new password.

## Frontend (Routes & UI)
The UI will feature separated routes based on the account context:
- `/user/settings`: Accessible to candidates.
- `/company/settings`: Accessible to companies.

**Layout & Components:**
- A sidebar or tab system to switch between "Perfil" (Profile) and "Segurança" (Security).
- **Profile Tab**:
  - Fetches current data using React Query.
  - Form validation with React Hook Form + Zod.
  - Includes input masks for CPF and CNPJ.
  - Calls `PATCH /users/me` or `PATCH /companies/me`.
- **Security Tab**:
  - A form with `currentPassword`, `newPassword`, and confirmation.
  - Calls `PATCH /accounts/me/password`.
- **Feedback**: Uses the existing Sonner toast notifications for success and error messages.
