# @focus-buddy/shared-utils

Shared utilities and schemas used across Focus Buddy applications.

## 📦 Usage

### Import in your app

```typescript
import { formatDate, createSlug, UserSchema } from '@focus-buddy/shared-utils';

// Use validation
const user = UserSchema.parse(userData);

// Use utilities
const formattedDate = formatDate(new Date());
const slug = createSlug('Hello World');
```

## 📁 Structure

- `schemas.ts` - Zod validation schemas
- `helpers.ts` - Utility functions

## 🔧 Building

```bash
# From monorepo root
bun build --filter=@focus-buddy/shared-utils

# Or from package directory
cd packages/shared-utils
npm run build
```

## 📝 Adding New Utilities

1. Create a new file in `src/` (e.g., `src/validators.ts`)
2. Export from `src/index.ts`
3. Run build to regenerate types

---

This package is used by:

- `@focus-buddy/extension`
- `@focus-buddy/api`
- `@focus-buddy/site`
