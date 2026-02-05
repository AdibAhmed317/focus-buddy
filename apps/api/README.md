# Focus Buddy Backend

NestJS API server for Focus Buddy platform.

## 🚀 Setup

### Initialize NestJS Project

```bash
# From apps/api
cd apps/api

# Install NestJS CLI globally (if not already)
npm install -g @nestjs/cli

# Generate NestJS project structure
nest new . --skip-git

# This will create:
# - src/app.controller.ts
# - src/app.service.ts
# - src/main.ts
# - test/ directory
```

### Setup Prisma (Database)

```bash
# Install Prisma
npm install @prisma/client
npm install -D prisma

# Initialize Prisma
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env file
```

### Development

```bash
# From monorepo root
bun dev --filter=@focus-buddy/api

# Or from apps/api
cd apps/backend
npm run start:dev
```

## 📊 Database

The backend uses Prisma ORM for database management.

### Setup Database

1. Configure `.env` with your database connection string
2. Create database schema in `prisma/schema.prisma`
3. Run migrations:

```bash
npx prisma migrate dev --name init
```

## 🔗 API Documentation

Once running, API will be available at `http://localhost:3000`

## 📦 Key Dependencies

- **@nestjs/common** - Core NestJS
- **@nestjs/core** - Core framework
- **@prisma/client** - ORM
- **class-validator** - Input validation
- **class-transformer** - Data transformation

## 🔗 Links

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Database Setup Guide](https://www.prisma.io/docs/getting-started/setup-prisma)

---

**Next Steps:**

1. Run `nest new . --skip-git` to scaffold the project
2. Configure database in `.env`
3. Define your data models in `prisma/schema.prisma`
4. Start development with `npm run start:dev`
