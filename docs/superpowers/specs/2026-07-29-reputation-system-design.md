# Reputation System (Ratings 1 to 5)

## 1. Context and Purpose
This feature addresses item `12.8` in the ToDo.MD. It introduces a two-way rating system where Companies and Users (Candidates) can rate each other after a job is successfully completed. Ratings help establish trust on the platform by keeping a public track record for both parties.

## 2. Architecture and Data Model
We are introducing a single `Review` table tied to the `Application` entity, as the Application is the single source of truth for an interaction between a User and a Company.

### Schema Additions (Prisma)
```prisma
enum ReviewDirection {
  COMPANY_TO_USER
  USER_TO_COMPANY
}

model Review {
  id            String          @id @default(uuid())
  applicationId String
  application   Application     @relation(fields: [applicationId], references: [id])
  direction     ReviewDirection
  rating        Int             // Integer between 1 and 5
  comment       String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@unique([applicationId, direction])
  @@map("reviews")
}
```

### Schema Updates
To ensure fast reads across the platform, we will cache the aggregated rating data on the respective target models:
- **User Model:** Add `averageRating Float @default(0)` and `reviewCount Int @default(0)`
- **Company Model:** Add `averageRating Float @default(0)` and `reviewCount Int @default(0)`

## 3. Core Business Logic & Constraints

### Eligibility Rules
- A review can **only** be submitted if the Application status is `APPROVED` and the associated Job status is `CLOSED_HIRED`.
- Any attempt to review a pending, rejected, or active job application will return a `400 Bad Request`.

### Authorization and Roles
- A logged-in user with role `COMPANY` reviewing an application triggers a `COMPANY_TO_USER` review.
- A logged-in user with role `USER` reviewing an application triggers a `USER_TO_COMPANY` review.
- A `403 Forbidden` error is returned if the logged-in account is not the owner of the application or the job.

### Cache Recalculation (Data Flow)
1. Upon successful review creation, the API publishes a `ReviewCreated` event to RabbitMQ.
2. A dedicated worker (e.g., `ReviewsConsumer`) picks up the event.
3. The worker queries all reviews for the target (User or Company), recalculates the exact arithmetic mean, and updates the `averageRating` and `reviewCount` fields on the entity.

## 4. API Endpoints

### 4.1. Submit Review
- **Route:** `POST /applications/:applicationId/reviews`
- **Payload:**
  ```json
  {
    "rating": 5,
    "comment": "Optional text feedback"
  }
  ```
- **Responses:**
  - `201 Created`: Success.
  - `400 Bad Request`: Validation failure or job/application not in closed/approved state.
  - `403 Forbidden`: User is not a participant in the application.
  - `409 Conflict`: Review in this direction already exists.

### 4.2. Get User Reviews
- **Route:** `GET /users/:userId/reviews`
- **Query Params:** `page`, `limit`
- **Response:** Paginated list of `COMPANY_TO_USER` reviews, including the Company's basic profile info.

### 4.3. Get Company Reviews
- **Route:** `GET /companies/:companyId/reviews`
- **Query Params:** `page`, `limit`
- **Response:** Paginated list of `USER_TO_COMPANY` reviews, including the User's basic profile info.

## 5. Testing Strategy
- **Unit Tests:** `CreateReviewService` to heavily validate the `APPROVED`/`CLOSED_HIRED` rule and permission boundaries.
- **Worker Tests:** Ensure the RabbitMQ consumer recalculates averages precisely and handles decimal rounding correctly.
- **E2E Tests:** Full flow of closing a job, creating a review, attempting to duplicate the review, and verifying the read endpoints.
