# Avatar Upload Design Spec

## Overview
This feature adds support for base64 encoded avatars/profile pictures across all user roles (Candidate, Company, and Admin) in the Hubb Vagas platform, fulfilling ToDo item 12.6. By converting images to base64 strings and compressing them on the frontend, we avoid the need for complex cloud storage solutions (like S3) while keeping database payloads small.

## 1. Data Model (Prisma)
- **New Model:** `AdminProfile`
  - Required because Admins currently only exist as an `Account`. We need a place to store their profile-specific data (like the avatar) separate from their authentication credentials, matching the pattern used for `User` and `Company`.
  - Fields: `id`, `name`, `avatarUrl`, `account_id`, `createdAt`, `updatedAt`.
- **Modified Models:** `User` and `Company`
  - Add `avatarUrl` (String, nullable) to both models.
  - *Future-proofing note:* We use the name `avatarUrl` instead of `avatarBase64`. Currently, this will store standard Base64 Data URIs (e.g., `data:image/jpeg;base64,...`). When migrating to AWS S3 in the future, the backend will just save the `https://s3...` URL into this exact same field. No database migrations or frontend changes will be required.

## 2. Backend & Architecture
- **Strategy Pattern Update:**
  - Create an `AdminProfileCreationStrategy` to handle the asynchronous creation of an `AdminProfile` when an `AccountCreated` event is processed by the RabbitMQ `AccountsConsumer`.
- **API Endpoints:**
  - Update `PATCH /users/profile` and `PATCH /companies/profile` to accept `avatarUrl`.
  - Create or update a `PATCH /admin/profile` route to allow admins to update their new profile.
- **Validation:**
  - Add Zod validations to ensure `avatarUrl` is a valid string, matches standard base64/data-uri formats (or standard URLs in the future), and doesn't exceed a reasonable character limit (preventing payload abuse).

## 3. Frontend Component & UX
- **`AvatarUpload` Component:**
  - A reusable React component containing a hidden `<input type="file" />`.
  - When a file is selected, the component loads the image into a hidden HTML `<canvas>`.
  - The canvas resizes/crops the image to a standardized square (e.g., 256x256 pixels) and exports it as a JPEG/PNG base64 data URI.
  - This Data URI string is then injected into the React Hook Form payload as `avatarUrl` and sent to the backend.
- **Default Avatar:**
  - Whenever an `avatarUrl` field is null or undefined, the UI will fallback to a default Lucide React icon (e.g., `<User />` or `<Building />`).

## 4. Error Handling
- **Frontend:** Reject files that are not images or are excessively large before they even reach the canvas processing.
- **Backend:** Return 413 Payload Too Large or 400 Bad Request if the base64 string exceeds the Zod validation limits.

## 5. Testing
- **Backend:** Add unit tests for the new `AdminProfileCreationStrategy`.
- **Frontend:** Add Vitest/RTL tests for the `AvatarUpload` component to ensure it properly handles file selection and triggers the callback.
