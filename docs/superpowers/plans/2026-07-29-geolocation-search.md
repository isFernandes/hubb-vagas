# Item 12.11: Busca por Geolocalização (Raio de Atuação) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow candidates to search for jobs within a specific kilometer radius from their location, using latitude and longitude coordinates.

**Architecture:**
1. Add `latitude` and `longitude` fields (Float, nullable) to both `Job` and `User` models in Prisma.
2. In `PrismaJobsRepository.findAll`, if `latitude`, `longitude`, and `radius` parameters are passed, execute a raw SQL query using the Haversine formula to find Job IDs within the specified radius.
3. Fetch the full Job details using standard Prisma `findMany` using the retrieved IDs. This integrates perfectly with existing relations, filters, and redis cache.
4. On the frontend, integrate Google Places API (or browser Geolocation API) to allow candidate to filter by radius, and input coordinates when companies create jobs.

**Tech Stack:** NestJS, Prisma (PostgreSQL), Vitest, React, Google Maps Geocoding (or equivalent mock)

## Global Constraints

- Distance calculation must happen directly in the PostgreSQL database using raw SQL to be efficient.
- Distance calculations should use the Haversine formula in kilometers (Earth radius = 6371 km).
- Address parsing can fallback to manual latitude/longitude input if geocoding fails.

---

## Technical Questions & Doubts

1. **How do we get coordinates?**
   - *Recommendation:* The frontend should obtain candidate's coordinates via browser location (Geolocation API) or a Google Maps autocomplete search bar. When creating a job, the company's address is geocoded on the frontend before sending it to the backend, or we geocode it on the backend via a simple third-party service like Nominatim (OSM). For simplicity, the API will accept optional `latitude` and `longitude` fields directly in the POST/PATCH request bodies.
2. **What if the database is SQLite in local development?**
   - *Recommendation:* The SQL `acos`, `cos`, `sin`, and `radians` functions are PostgreSQL-specific. We assume development and production environments run PostgreSQL. If local development uses SQLite, we will write a fallback logic in JavaScript/TypeScript for the repository level.

---

### Task 1: Database Migration for Geolocation Fields

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

**Interfaces:**
- Consumes: Prisma schema.
- Produces: `latitude` (Float?) and `longitude` (Float?) fields on `Job` and `User` models.

- [ ] **Step 1: Write schema changes**

Update `schema.prisma`:
```prisma
model User {
  id            String             @id @default(uuid())
  // ... existing fields ...
  latitude      Float?
  longitude     Float?
  // ... remaining fields ...
}

model Job {
  id            String             @id @default(uuid())
  // ... existing fields ...
  latitude      Float?
  longitude     Float?
  // ... remaining fields ...
}
```

- [ ] **Step 2: Generate client and migrate**

Run: `npx prisma generate`
Run: `npx prisma migrate dev --name add_geolocation_coordinates`
Expected: Database updated successfully.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma
git commit -m "db: add latitude and longitude to User and Job models"
```

---

### Task 2: Repository Geolocation Query

**Files:**
- Modify: `apps/api/src/repositories/jobs.repository.ts`
- Modify: `apps/api/src/infra/prisma/prisma-repository/prismaJobs.repository.ts`
- Create/Modify: `apps/api/src/infra/prisma/prisma-repository/prismaJobs.repository.spec.ts`

**Interfaces:**
- Consumes: `latitude`, `longitude`, `radius` parameters in `JobsRepository.findAll`.
- Produces: Array of jobs sorted by proximity.

- [ ] **Step 1: Update repository interface**

Update `JobsRepository.findAll` signature in `apps/api/src/repositories/jobs.repository.ts`:
```typescript
abstract findAll(filters?: {
  location?: string;
  contractType?: string;
  companyId?: string;
  search?: string;
  status?: any;
  latitude?: number;   // <-- Added
  longitude?: number;  // <-- Added
  radius?: number;     // <-- Added
}): Promise<any[]>;
```

- [ ] **Step 2: Implement Haversine Raw Query in PrismaJobsRepository**

Update `PrismaJobsRepository.findAll` to handle coords:
```typescript
async findAll(filters?: any): Promise<any[]> {
  const where: any = {};
  // ... handle other filters ...

  if (filters?.latitude && filters?.longitude && filters?.radius) {
    const lat = filters.latitude;
    const lng = filters.longitude;
    const radiusKm = filters.radius;

    // Use raw query to retrieve IDs within radius
    const matchingJobs: { id: string }[] = await this.prisma.$queryRaw`
      SELECT id FROM jobs
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        AND (6371 * acos(
          cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + 
          sin(radians(${lat})) * sin(radians(latitude))
        )) <= ${radiusKm}
    `;

    const ids = matchingJobs.map(j => j.id);
    where.id = { in: ids };
  }

  return this.prisma.job.findMany({ where, include: { company: true } });
}
```

- [ ] **Step 3: Test proximity querying**

Verify with a unit/integration test that creating two jobs (one 5km away, one 50km away) and searching with radius 10km only returns the closer job.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/repositories/jobs.repository.ts apps/api/src/infra/prisma/prisma-repository/prismaJobs.repository.ts
git commit -m "feat: add Haversine geolocation search to PrismaJobsRepository"
```

---

### Task 3: Jobs Controller Query Parameters

**Files:**
- Modify: `apps/api/src/jobs/jobs.controller.ts`
- Modify: `apps/api/src/jobs/jobs.service.ts`

**Interfaces:**
- Consumes: HTTP GET `/jobs?latitude=X&longitude=Y&radius=Z`
- Produces: Proximity filtered jobs list.

- [ ] **Step 1: Add query parameters to controller**

Add query decorators in `jobs.controller.ts` to parse `latitude`, `longitude` and `radius` from query as floats and pass them to the service.

- [ ] **Step 2: Update Cache Key logic in jobs.service.ts**

Update `invalidateListCaches` and `findAll` cache key generation to include geolocation parameters so users get accurate coordinates-based cached lists.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: expose geolocation parameters in JobsController and adjust caching"
```

---

### Task 4: Frontend Map and Proximity Search

**Files:**
- Modify: `apps/web/src/pages/candidate/JobList.tsx`
- Modify: `apps/web/src/pages/company/CreateJob.tsx`

**Interfaces:**
- Consumes: Proximity search parameters.
- Produces: Proximity filters and map/badge overlays.

- [ ] **Step 1: Implement "Buscar Vagas Próximas" filter**

In Candidate's Job List page, add a slider for Proximity Radius (5km, 10km, 25km, 50km) and a button to get user's location via `navigator.geolocation.getCurrentPosition`.

- [ ] **Step 2: Update create job form**

Provide manual latitude/longitude input or browser geocoding placeholder on the Create Job page for companies.

- [ ] **Step 3: Commit**

```bash
git commit -am "feat: add geolocation proximity filters in frontend"
```
