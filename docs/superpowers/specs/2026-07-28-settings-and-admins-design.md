# Global Settings & Admin Management (13.6 & 13.7)

## Overview
This phase introduces the foundational `GlobalConfig` system to control platform-wide variables (like fees and minimum job prices) dynamically, and implements "Option B" for Admin Management, allowing existing admins to directly create new admin accounts.

## Database Schema Changes (Prisma)
1. **New Model `GlobalConfig`:**
   - `id` (String, default uuid)
   - `platformFeePercentage` (Float, default 10.0)
   - `minimumJobPriceCents` (Int, default 5000 -> R$ 50,00)
   - `createdAt` (DateTime)
   - `updatedAt` (DateTime)
   *Note: We will enforce that only one row exists in this table (or we just always query the first row).*

## Backend API Updates
### Global Settings (AdminController)
- **`GET /admin/settings`**: Retrieves the current global configuration. If none exists, creates the default row and returns it.
- **`PATCH /admin/settings`**: Updates the global configuration.
- **Job Creation Validation**: Update `JobsService.create` to fetch `GlobalConfig` and throw an exception if `paymentAmountCents` is less than `minimumJobPriceCents`.

### Admin Management (AdminController)
- **`POST /admin/admins`**: 
  - **Body**: `{ email, password }`
  - **Behavior**: Hashes the password and creates a new `Account` with `Role.ADMIN`. Returns the new account (excluding the password).

## Frontend Updates
### Global Settings Page
- **Route**: `/admin/settings`
- **UI**: A form to view and update the `platformFeePercentage` and `minimumJobPriceCents` (with proper currency formatting).

### Admin Management
- **UI Update**: On the existing `/admin/users` page, add a "Create Admin" button in the top right.
- **Modal**: A simple form that takes `email` and `password`, calling the new `POST /admin/admins` endpoint, and invalidating the users list upon success.
