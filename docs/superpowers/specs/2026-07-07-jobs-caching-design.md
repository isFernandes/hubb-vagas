# Jobs Caching Design

## 1. Overview
This specification covers the implementation of Redis-based caching for Job listings (Task 4.2) and Job details (Task 4.3). The purpose of this caching layer is to reduce database load on the high-traffic read operations of the application, utilizing the existing `RedisModule` and `ioredis` client.

## 2. Job Listing Cache (4.2)
- **Target**: `findAll` method in `JobsService`.
- **Key Format**: `job:list:{filtersHash}`, where `filtersHash` is a base64 encoded JSON string of the requested filters object to ensure unique cache keys for different query parameters.
- **TTL**: 3 minutes (180 seconds).
- **Behavior**:
  - Intercept the `findAll` request.
  - Attempt to fetch data from Redis.
  - If Cache Hit: Parse JSON and return.
  - If Cache Miss: Query `jobsRepository.findAll`, cache the resulting data as a JSON string with the 3-minute TTL, and return the data.
- **Invalidation Strategy**: Implicit invalidation via the short 3-minute TTL. No explicit invalidation logic is needed when a job is created or updated, avoiding complex key scanning (SCAN) across the dataset.

## 3. Job Detail Cache (4.3)
- **Target**: `findOne` method in `JobsService`.
- **Key Format**: `job:detail:{id}`.
- **TTL**: 1 hour (3600 seconds).
- **Behavior**:
  - Attempt to fetch data from Redis.
  - If Cache Hit: Parse JSON and return.
  - If Cache Miss: Query `jobsRepository.findById`, cache the resulting data with the 1-hour TTL, and return.
- **Invalidation Strategy**: Explicit invalidation.
  - In `JobsService`: When `update` or `remove` are called successfully, delete the cache key `job:detail:{id}`.
  - In `JobClosureWorker`: When a job is closed asynchronously via an accepted application, the worker must also delete the cache key `job:detail:{id}` to prevent stale (open) jobs from appearing in the details page.

## 4. Dependencies & Injection
- **Redis Client**: Both `JobsService` and `JobClosureWorker` will inject the `REDIS_CLIENT` provider from `RedisModule`.
- **Serialization**: Data will be serialized using `JSON.stringify` before storing in Redis and deserialized with `JSON.parse` upon retrieval.

## 5. Fallback/Error Handling
- Redis commands should be wrapped in `try/catch` to ensure that if Redis is down, the application gracefully degrades by logging the error and proceeding to fetch directly from the database (Postgres).
