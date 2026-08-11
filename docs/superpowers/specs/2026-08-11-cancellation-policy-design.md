# Cancellation Policy & No-Show Punishment Design

## Purpose
This feature implements a cancellation policy for candidates to withdraw their applications. If a candidate cancels an `APPROVED` gig very close to its execution time, they suffer an automatic penalty to their reputation rating. This deters No-Shows and protects companies, while automatically rotating to a Standby candidate to salvage the gig.

## Architecture & Data Flow

### 1. Database (Prisma Schema)
- Add `CANCELLED` to `ApplicationStatus` enum.
- This differentiates user-driven cancellations from company-driven rejections (`REJECTED`).

### 2. Backend (API & Services)
- **Endpoint**: `PATCH /applications/:id/cancel` in `applications.controller.ts`.
- **Validation**: 
  - Ensure the request comes from the `User` owning the application.
  - Can only cancel if the application status is NOT already cancelled or rejected.
- **Penalty Logic**:
  - If the application status is `APPROVED` and the job has an `executionDate`:
    - Calculate hours remaining until `executionDate`.
    - If `< 5 hours`: Deduct `1.5` points from the user's `averageRating`.
    - If `>= 5 hours` AND `< 24 hours`: Deduct `1.0` point from `averageRating`.
    - Ensure `averageRating` does not fall below `0.0`.
- **Standby Promotion**:
  - If the application was `APPROVED`, invoke `StandbyPromotionService.promoteNextStandby(jobId)` to pull the next candidate in line and revert the job status to `PUBLISHED` (handled by the service).
- **Messaging/Events**:
  - Emit an `application_cancelled` event to RabbitMQ, notifying the company via the notification worker.

### 3. Frontend (React)
- **Component**: Add a "Cancelar Candidatura" button to the application cards in `MyApplications.tsx` and possibly in `JobDetailsCandidate.tsx`.
- **Modal Validation**: 
  - When clicked, prompt the user with a confirmation modal.
  - If the time to the gig is under 24 hours, display a strong warning: *"Atenção: Cancelar este bico tão perto do horário de início afetará negativamente sua reputação na plataforma."*
  - The exact point deduction is NOT shown to the user to avoid gamification or negotiation behavior, keeping the focus on the negative reputational impact.

## Error Handling
- Return `400 Bad Request` if trying to cancel an already cancelled gig.
- Return `403 Forbidden` if the user does not own the application.
- Catch RabbitMQ emission errors silently so they don't block the cancellation persistence.

## Testing
- Ensure the rating deduction calculates properly without dropping below zero.
- Ensure Standby promotion triggers if and only if the application was `APPROVED`.
- Test UI modal warnings dynamically based on the job's `executionDate`.
