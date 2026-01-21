# ShadowLaunch API

Private Token Launchpad Backend for Aleo - Built with Express.js, TypeScript, and Prisma.

## Overview

ShadowLaunch is a fair token launch platform leveraging Aleo's zero-knowledge infrastructure to prevent front-running, sniping, and bot manipulation. This backend API manages the commit-reveal scheme, allocation calculations, and Aleo blockchain interactions.

## Architecture

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Validation**: Zod
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

### Project Structure

```
shadowlaunch-api/
├── src/
│   ├── config/           # Configuration (env, database)
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware (auth, validation, error)
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   │   ├── aleo.service.ts          # Aleo transaction building
│   │   ├── launch.service.ts        # Launch management
│   │   ├── commit.service.ts        # Commitment handling
│   │   ├── reveal.service.ts        # Reveal phase logic
│   │   └── allocation.service.ts    # Token allocation calculations
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utilities (crypto, logger, validators)
│   ├── app.ts            # Express app configuration
│   └── index.ts          # Server entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── .env.example          # Environment variables template
├── package.json
└── tsconfig.json
```

## Features

### 1. Launch Management
- Create new token launches
- Multi-phase lifecycle (PENDING → COMMIT → REVEAL → DISTRIBUTION → ENDED)
- Automatic phase transitions based on block height/time
- Real-time statistics tracking

### 2. Commit Phase
- Generate cryptographic commitments with encrypted secrets
- Hash user addresses for privacy
- Build Aleo transactions for on-chain commits
- Track confirmation status

### 3. Reveal Phase
- Decrypt user secrets securely
- Verify commitments match reveals
- Calculate pro-rata allocations
- Handle oversubscription scenarios

### 4. Security Features
- AES-256-GCM encryption for secrets
- SHA-256 hashing for commitments
- JWT authentication ready
- Rate limiting per IP
- Input validation with Zod schemas
- Helmet security headers

## API Endpoints

### Launches

**Create Launch**
```http
POST /api/v1/launches
Content-Type: application/json

{
  "name": "MyToken Launch",
  "description": "Fair launch for MyToken",
  "tokenSymbol": "MTK",
  "totalSupply": "1000000",
  "pricePerToken": "100",
  "commitDurationBlocks": 1000,
  "revealDurationBlocks": 500,
  "creatorAddress": "aleo1..."
}
```

**List Launches**
```http
GET /api/v1/launches?status=COMMIT_PHASE&page=1&limit=10
```

**Get Launch Details**
```http
GET /api/v1/launches/:id
```

**Phase Management**
```http
POST /api/v1/launches/:id/start-commit
POST /api/v1/launches/:id/start-reveal
POST /api/v1/launches/:id/complete
```

### Commits

**Prepare Commitment**
```http
POST /api/v1/commits/prepare
Content-Type: application/json

{
  "launchId": "uuid",
  "userAddress": "aleo1...",
  "amount": "1000"
}
```

Response includes:
- `commitId`: Unique commitment identifier
- `secretHash`: Hash to submit on-chain
- `encryptedSecret`: Encrypted backup of secret
- `transaction`: Aleo transaction object

**Confirm Commitment**
```http
POST /api/v1/commits/confirm
Content-Type: application/json

{
  "commitId": "uuid",
  "transactionId": "at1..."
}
```

**Get User's Commit**
```http
GET /api/v1/commits/:launchId/:userAddress
```

### Reveals

**Prepare Reveal**
```http
POST /api/v1/reveals/prepare
Content-Type: application/json

{
  "launchId": "uuid",
  "userAddress": "aleo1..."
}
```

**Confirm Reveal**
```http
POST /api/v1/reveals/confirm
Content-Type: application/json

{
  "launchId": "uuid",
  "userAddress": "aleo1...",
  "transactionId": "at1..."
}
```

**Get Reveal Stats**
```http
GET /api/v1/reveals/stats/:launchId
```

**Get Allocations**
```http
GET /api/v1/reveals/allocations/:launchId
GET /api/v1/reveals/allocation/:launchId/:userAddress
```

## Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Aleo SDK (optional, for local testing)

### Setup

1. **Clone and navigate**
```bash
cd shadowlaunch/apps/api
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3001

# PostgreSQL connection
DATABASE_URL="postgresql://user:password@localhost:5432/shadowlaunch?schema=public"

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=24h

# Aleo Network
ALEO_NETWORK=testnet
ALEO_API_URL=https://api.explorer.aleo.org/v1
ALEO_PROGRAM_ID=shadowlaunch_v1.aleo

# CORS
CORS_ORIGIN=http://localhost:3000
```

4. **Setup database**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

5. **Start development server**
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## Database Schema

### Launch
- Stores token launch configurations
- Tracks phase transitions and timestamps
- Maintains participant and commitment statistics

### PendingCommit
- Records user commitments during commit phase
- Stores encrypted secrets and commitment hashes
- Tracks confirmation and reveal status

### Allocation
- Calculated during reveal phase
- Stores pro-rata token allocations
- Tracks distribution status

### User
- User authentication data
- Hashed addresses for privacy

## Security Considerations

### Cryptography
- **AES-256-GCM**: Symmetric encryption for secrets
- **PBKDF2**: Key derivation with 100,000 iterations
- **SHA-256**: Hashing for commitments and addresses
- **Timing-Safe Comparison**: HMAC verification

### Privacy
- User addresses are hashed before storage
- Secrets are encrypted with user's address as password
- Commitments hide amounts until reveal phase

### Rate Limiting
- 100 requests per 15 minutes per IP (configurable)
- Applied to all `/api/*` routes

### Input Validation
- Zod schemas for all inputs
- Aleo address format validation
- Transaction ID validation
- BigInt string validation

## Allocation Algorithm

The allocation service implements pro-rata distribution:

**When Oversubscribed:**
```
allocation = (user_commitment / total_revealed) * total_supply
refund = user_commitment - (allocation * price_per_token)
```

**When Undersubscribed:**
```
allocation = user_commitment / price_per_token
refund = user_commitment % price_per_token
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { } // Only in development
  },
  "metadata": {
    "timestamp": "2024-01-20T12:00:00.000Z",
    "version": "v1"
  }
}
```

## Logging

Winston logger with levels:
- **error**: Critical errors
- **warn**: Warning messages
- **info**: General information
- **debug**: Detailed debug info (dev only)

Logs are written to:
- `logs/error.log` - Error level only
- `logs/combined.log` - All levels
- Console - Development mode

## Testing

```bash
# Run tests (when implemented)
npm test

# Run linter
npm run lint
```

## Background Jobs

The server runs a background job that:
- Checks for launches where commit phase has ended → starts reveal phase
- Checks for launches where reveal phase has ended → completes launch
- Runs every 60 seconds

## Development

### Adding New Endpoints

1. Define route in `src/routes/*.routes.ts`
2. Create controller in `src/controllers/*.controller.ts`
3. Implement business logic in `src/services/*.service.ts`
4. Add validation schema in `src/utils/validators.ts`

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Deployment

### Environment Variables
Ensure all production environment variables are set:
- Use strong JWT_SECRET
- Set NODE_ENV=production
- Configure production DATABASE_URL
- Set appropriate CORS_ORIGIN

### Process Management
Use PM2 or similar:

```bash
npm install -g pm2
pm2 start dist/index.js --name shadowlaunch-api
pm2 save
```

### Reverse Proxy
Configure nginx or similar for SSL/TLS:

```nginx
server {
    listen 443 ssl;
    server_name api.shadowlaunch.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Performance Optimization

- Database indexes on frequently queried fields
- Connection pooling via Prisma
- Response compression enabled
- Rate limiting to prevent abuse

## Contributing

1. Follow TypeScript strict mode
2. Use Zod for validation
3. Write descriptive error messages
4. Add JSDoc comments for complex logic
5. Keep services focused and single-purpose

## License

MIT

## Support

For issues or questions, please open an issue on the repository.

---

**Built for Aleo** - Privacy-preserving blockchain infrastructure
