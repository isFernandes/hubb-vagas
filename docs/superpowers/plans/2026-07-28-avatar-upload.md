# Avatar Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement profile avatar uploads using auto-compressed Base64 Data URIs across all user roles (User, Company, Admin) to avoid S3 requirements while maintaining future-proofing.

**Architecture:** We will extend the Prisma schema to add an `AdminProfile` model and an `avatarUrl` field to all profile models. The backend will update Zod schemas to validate this Data URI, and the frontend will compress images in-browser via Canvas before form submission.

**Tech Stack:** NestJS, Prisma, React, Vite, HTML5 Canvas, Zod.

## Global Constraints

- Backend is NestJS in `apps/api`.
- Frontend is React in `apps/web`.
- Use `npx prisma generate` after schema changes.
- Ensure all tests pass with `turbo run test`.

---

### Task 1: Prisma Schema Updates

**Files:**
- Modify: `apps/api/src/infra/prisma/schema.prisma`

**Interfaces:**
- Produces: `AdminProfile` model, `avatarUrl` on `User` and `Company`.

- [ ] **Step 1: Write the schema changes**

```prisma
// Add to schema.prisma
model AdminProfile {
  id        String   @id @default(uuid())
  name      String
  avatarUrl String?
  accountId String   @unique
  account   Account  @relation(fields: [accountId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("admin_profiles")
}

// And update the existing Account model to link it:
// adminProfile AdminProfile?

// Update User and Company models:
// add: avatarUrl String?
```

- [ ] **Step 2: Generate Prisma Client and create migration**

Run: `npx prisma generate` (inside `apps/api`)
Run: `npx prisma migrate dev --name add_avatar_url_and_admin_profile` (inside `apps/api`)
Expected: Migration created successfully.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/infra/prisma/schema.prisma apps/api/prisma/migrations/
git commit -m "feat(db): add AdminProfile and avatarUrl to profiles"
```

### Task 2: Strategy Pattern Updates for AdminProfile

**Files:**
- Create: `apps/api/src/accounts/strategies/admin-profile.strategy.ts`
- Modify: `apps/api/src/accounts/accounts.consumer.ts`

**Interfaces:**
- Consumes: Prisma `AdminProfile`
- Produces: Auto-created `AdminProfile` when an admin account is registered.

- [ ] **Step 1: Write AdminProfileCreationStrategy**

```typescript
// apps/api/src/accounts/strategies/admin-profile.strategy.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AdminProfileCreationStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(accountId: string, email: string): Promise<void> {
    await this.prisma.adminProfile.create({
      data: {
        accountId,
        name: email.split('@')[0], // default name
      },
    });
  }
}
```

- [ ] **Step 2: Update AccountsConsumer**

```typescript
// apps/api/src/accounts/accounts.consumer.ts
// Inject AdminProfileCreationStrategy and call it when role === 'ADMIN'
// in the handleAccountCreated method.
```

- [ ] **Step 3: Verify build**

Run: `npx turbo run build --filter=api`
Expected: Successful build.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/accounts/
git commit -m "feat(api): add admin profile creation strategy"
```

### Task 3: Backend API Endpoints & Validation

**Files:**
- Modify: `apps/api/src/users/dto/update-profile.dto.ts` (or similar Zod schema)
- Modify: `apps/api/src/companies/dto/update-company.dto.ts`
- Modify: `apps/api/src/admin/dto/update-admin.dto.ts`

**Interfaces:**
- Produces: Endpoints that accept `avatarUrl: z.string().optional()`.

- [ ] **Step 1: Update DTOs with Zod validation**

```typescript
// Add to the Zod schemas for updating profiles:
avatarUrl: z.string().max(500000, "Avatar image is too large").optional()
```

- [ ] **Step 2: Update Services**

```typescript
// Ensure the update services pass the avatarUrl to the Prisma update queries for User, Company, and AdminProfile.
```

- [ ] **Step 3: Test endpoints locally**

Run: `npx turbo run test --filter=api`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/
git commit -m "feat(api): add avatarUrl to profile update endpoints"
```

### Task 4: Frontend AvatarUpload Component

**Files:**
- Create: `apps/web/src/components/ui/AvatarUpload.tsx`

**Interfaces:**
- Produces: `<AvatarUpload onImageCompressed={(base64) => void} defaultImage={string | null} />`

- [ ] **Step 1: Create the component**

```tsx
// apps/web/src/components/ui/AvatarUpload.tsx
import React, { useRef, useState } from 'react';
import { User } from 'lucide-react';

interface Props {
  defaultImage?: string | null;
  onImageCompressed: (base64: string) => void;
}

export function AvatarUpload({ defaultImage, onImageCompressed }: Props) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;

        if (ctx) {
          ctx.drawImage(img, 0, 0, 256, 256);
          const dataUri = canvas.toDataURL('image/jpeg', 0.8);
          setPreview(dataUri);
          onImageCompressed(dataUri);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <User className="w-12 h-12 text-gray-400" />
        )}
      </div>
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={inputRef}
        onChange={handleFile}
      />
      <span className="text-sm text-gray-500">Click to upload avatar</span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/ui/AvatarUpload.tsx
git commit -m "feat(web): add AvatarUpload component with canvas compression"
```

### Task 5: Frontend Profile Forms Integration

**Files:**
- Modify: `apps/web/src/pages/settings/ProfileSettings.tsx` (or equivalent profile edit pages)

**Interfaces:**
- Consumes: `<AvatarUpload>`
- Produces: React Hook Form payloads including `avatarUrl`.

- [ ] **Step 1: Integrate AvatarUpload into forms**

```tsx
// Inside your Profile Settings form component:
<AvatarUpload 
  defaultImage={profileData?.avatarUrl} 
  onImageCompressed={(base64) => setValue('avatarUrl', base64, { shouldDirty: true })} 
/>
```

- [ ] **Step 2: Verify build**

Run: `npx turbo run build --filter=web`
Expected: Successful build.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/pages/
git commit -m "feat(web): integrate avatar upload into profile settings"
```
