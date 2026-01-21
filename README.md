<div align="center">

# ShadowLaunch

### Fair Token Launches on Aleo — No Snipers. No Bots. No Front-Running.

[![Aleo](https://img.shields.io/badge/Built%20on-Aleo-blue?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADASURBVHgBjZLBDcIwDEV/WoYoG8AGsAFsQDdgBDagG5QN6AZ0g7ABbEA3aDeo/kkdFKWq+6Qoif3t2HEEBkRENV4xPPGO4YkXRORjLMYYaq0V1lpfWGsP1trNf6mqirIsEUKAiBCRz7X5vXOOzrkfZ+fcLqV0+FdUVZWTJPnudW6992ee5x9xHC++RkQ4hEgpSyL64D0+BqF9SkT0a4wxW2PMPgjCI631MQiCTRiGy67rFl3X7YQQq6IoFnVdr/8An6Y/GdZf7e4AAAAASUVORK5CYII=)](https://aleo.org)
[![Leo](https://img.shields.io/badge/Smart%20Contract-Leo-purple?style=for-the-badge)](https://developer.aleo.org/leo/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Hackathon](https://img.shields.io/badge/Aleo-Hackathon%202025-orange?style=for-the-badge)](https://aleo.org)

**Privacy-preserving token launchpad eliminating MEV exploitation through ZK-powered commit-reveal mechanics**

[View Demo](#demo-video) · [Smart Contract](#deployed-contract) · [Try It Locally](#quick-start)

</div>

---

## Deployed Contract

| Network | Program ID | Explorer |
|---------|------------|----------|
| **Testnet** | `shadowlaunch_v1.aleo` | [View on Aleo Explorer](https://testnet.aleoscan.io/program?id=shadowlaunch_v1.aleo) |

```
Program ID: shadowlaunch_v1.aleo
Network: Aleo Testnet Beta
```

---

## Demo Video

https://github.com/user-attachments/assets/YOUR_VIDEO_ID

> *Full walkthrough: Creating a launch, committing funds, revealing, and claiming tokens*

---

## The Problem We Solve

Every token launch on transparent blockchains suffers from the same issues:

| Problem | Impact | Who Wins |
|---------|--------|----------|
| **Front-running** | MEV bots see your tx and jump ahead | Bots |
| **Sniping** | Automated scripts grab allocations instantly | Whales |
| **Information Leakage** | Everyone sees what others are bidding | Insiders |
| **Timing Attacks** | Network latency determines allocation | Infrastructure |

**Result:** Regular users consistently lose to sophisticated actors.

---

## Our Solution: ZK Commit-Reveal

ShadowLaunch uses Aleo's zero-knowledge proofs to create a **truly fair** launch mechanism:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           SHADOWLAUNCH PROTOCOL                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   PHASE 1: COMMIT                      PHASE 2: REVEAL                   │
│   ═══════════════                      ═══════════════                   │
│                                                                          │
│   User A: Hash(100 + secret_a) ───┐    User A reveals: 100 ALEO         │
│   User B: Hash(50 + secret_b)  ───┼──► User B reveals: 50 ALEO          │
│   User C: Hash(200 + secret_c) ───┘    User C reveals: 200 ALEO         │
│                                                                          │
│   ❌ Nobody knows amounts              ✓ Pro-rata allocation:            │
│   ❌ Can't front-run                      A: 28.5% of tokens             │
│   ❌ Can't adjust based on others         B: 14.3% of tokens             │
│                                           C: 57.1% of tokens             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Why This Works

1. **Commitments are binding** — Hash(amount + secret) cannot be changed
2. **Amounts are hidden** — ZK proofs verify without revealing
3. **No timing advantage** — All commits treated equally regardless of when submitted
4. **Trustless verification** — Smart contract enforces fairness on-chain

---

## Key Features

| Feature | Implementation |
|---------|----------------|
| **Private Commitments** | BHP256 hash of (amount + user-generated secret) |
| **Anti-Whale Limits** | Configurable max contribution per address |
| **Flexible Caps** | Soft cap (minimum) and hard cap (maximum) fundraise |
| **On-Chain Logic** | 100% of verification runs on Aleo smart contract |
| **Wallet Integration** | Native Leo Wallet support with transaction signing |
| **Real-Time UI** | Live phase indicators, countdown timers, status updates |

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 14)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Create Page │  │ Launch Page │  │  Dashboard  │              │
│  │  /create    │  │ /launch/:id │  │ /dashboard  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                       │
│              ┌───────────────────────┐                          │
│              │   Leo Wallet Adapter  │                          │
│              │   (Transaction Sign)  │                          │
│              └───────────┬───────────┘                          │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                          ▼            BACKEND (Express.js)       │
│              ┌───────────────────────┐                          │
│              │    REST API Server    │                          │
│              │    (Port 3014)        │                          │
│              └───────────┬───────────┘                          │
│                          │                                       │
│    ┌─────────────────────┼─────────────────────┐                │
│    ▼                     ▼                     ▼                │
│ ┌──────────┐      ┌──────────┐          ┌──────────┐           │
│ │ Launch   │      │ Commit   │          │ Reveal   │           │
│ │ Service  │      │ Service  │          │ Service  │           │
│ └────┬─────┘      └────┬─────┘          └────┬─────┘           │
│      └─────────────────┼─────────────────────┘                  │
│                        ▼                                         │
│              ┌───────────────────────┐                          │
│              │   Prisma ORM + SQLite │                          │
│              └───────────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ALEO BLOCKCHAIN (Testnet)                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              shadowlaunch_v1.aleo                        │    │
│  │                                                          │    │
│  │  Transitions:                     Mappings:              │    │
│  │  ├─ create_launch()              ├─ launch_phase        │    │
│  │  ├─ commit()                     ├─ commitments         │    │
│  │  ├─ reveal()                     ├─ reveals             │    │
│  │  └─ end_reveal_phase()           └─ total_revealed      │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Smart Contract Highlights

```leo
program shadowlaunch_v1.aleo {
    // Private commitment record - only owner can see amount
    record Commitment {
        owner: address,
        launch_id: field,
        amount: u64,
        secret: field,
        commitment_hash: field,
    }

    // Create new token launch with parameters
    async transition create_launch(
        launch_id: field,
        token_symbol: field,
        total_supply: u64,
        price_per_token: u64,
        commit_duration: u32,
        reveal_duration: u32,
    ) -> Future;

    // Submit sealed commitment (amount hidden)
    async transition commit(
        launch_id: field,
        amount: u64,
        secret: field,
    ) -> (Commitment, Future);

    // Reveal commitment and verify hash
    async transition reveal(
        commitment: Commitment,
    ) -> Future;
}
```

**Privacy Features:**
- `BHP256::hash_to_field()` for commitment hashing
- Private records hide amounts until reveal
- Address hashing prevents tracking

---

## Quick Start

### Prerequisites
- Node.js 18+
- [Leo Wallet](https://www.leo.app/) browser extension
- Testnet ALEO from [faucet](https://faucet.aleo.org)

### Run Locally

```bash
# Clone
git clone https://github.com/alberteinstien62-blip/Shadow-Launch.git
cd Shadow-Launch

# Install
npm install

# Setup database
cd apps/api && npx prisma db push && cd ../..

# Configure environment
cp apps/web/.env.example apps/web/.env.local

# Start servers (2 terminals)
cd apps/api && npm run dev    # Terminal 1: API on :3014
cd apps/web && npm run dev    # Terminal 2: Web on :3004
```

Open http://localhost:3004 and connect your Leo Wallet.

---

## User Flow

| Step | Action | What Happens |
|------|--------|--------------|
| 1 | **Connect Wallet** | Leo Wallet authentication |
| 2 | **Create Launch** | Set token params, deploy to Aleo |
| 3 | **Share Link** | Distribute launch URL |
| 4 | **Commit Phase** | Users submit hidden bids |
| 5 | **Reveal Phase** | Users prove their commitments |
| 6 | **Distribution** | Pro-rata token allocation |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Smart Contract | Leo (Aleo) |
| Frontend | Next.js 14, React 18, TailwindCSS |
| Backend | Express.js, TypeScript |
| Database | Prisma ORM, SQLite |
| Wallet | Leo Wallet Adapter |
| Animations | Framer Motion |
| Styling | Cyberpunk Theme, Glass Morphism |

---

## Project Structure

```
Shadow-Launch/
├── contracts/                 # Leo smart contract
│   └── src/main.leo          # Core protocol logic
├── apps/
│   ├── api/                  # Express.js backend
│   │   ├── src/
│   │   │   ├── services/     # Business logic
│   │   │   ├── routes/       # API endpoints
│   │   │   └── utils/        # Crypto helpers
│   │   └── prisma/           # Database schema
│   └── web/                  # Next.js frontend
│       └── src/
│           ├── app/          # Pages
│           └── components/   # React components
└── packages/
    ├── sdk/                  # Shared utilities
    └── ui/                   # Component library
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/launches` | Create new launch |
| `GET` | `/api/launches` | List all launches |
| `GET` | `/api/launches/:id` | Get launch details |
| `PATCH` | `/api/launches/:id` | Update on-chain status |
| `POST` | `/api/commits/prepare` | Generate commitment |
| `POST` | `/api/reveals/prepare` | Prepare reveal tx |

---

## Security Model

| Aspect | Implementation |
|--------|----------------|
| Commitment Binding | Hash cannot be reversed or changed |
| Secret Entropy | Client-side cryptographic random |
| Phase Transitions | Block height based (not timestamps) |
| Overflow Protection | Leo's native overflow checks |
| Front-run Prevention | Amounts hidden during commit phase |

---

## Future Roadmap

- [ ] Credits escrow (lock ALEO during commit)
- [ ] ARC-21 token standard integration
- [ ] Multi-signature launch creation
- [ ] Cross-chain bridge support
- [ ] Mobile wallet SDK

---

## Built For

<div align="center">

**Aleo Hackathon 2025**

*Privacy-Preserving DeFi Track*

</div>

---

## License

MIT License — see [LICENSE](LICENSE)

---

<div align="center">

**ShadowLaunch** — *Fair launches for everyone.*

[GitHub](https://github.com/alberteinstien62-blip/Shadow-Launch) · [Aleo Explorer](https://testnet.aleoscan.io/program?id=shadowlaunch_v1.aleo)

</div>
