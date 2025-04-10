# Database Migrations

This directory contains the database migrations for the BountyCoder application. The migrations are managed using Prisma ORM.

## Migration Structure

- `schema.prisma`: The Prisma schema file that defines the database models
- `migrations/`: Directory containing all migration files
  - Each migration is in a timestamped folder (e.g., `20250410014704_init`)
  - Each migration folder contains a `migration.sql` file with the SQL statements

## Running Migrations

### Development Environment

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name <migration_name>

# Apply all pending migrations
npx prisma migrate deploy
```

### Production Environment

In production, use the migration script:

```bash
node scripts/migrate.js
```

## Database Models

The schema includes the following models:

1. **User**: Represents admin users and customers
   - Has role-based access control (ADMIN, CUSTOMER)
   - Linked to API keys

2. **ApiKey**: Represents API keys for accessing the LLM service
   - Each key belongs to a user
   - Has custom rate limits
   - Tracks usage statistics

3. **Usage**: Tracks token usage for billing and analytics
   - Records tokens used per request
   - Links to API key and model used

4. **LLMModel**: Represents available LLM models
   - Includes configuration for each model
   - Tracks performance metrics

## Best Practices

1. Always create a migration for schema changes
2. Test migrations in development before deploying to production
3. Never modify existing migrations, create new ones instead
4. Use the migration script for production deployments
5. Back up the database before running migrations in production
