# ShadowLaunch

> **Fair Token Launches on Aleo — No Snipers. No Bots. No Front-Running.**

ShadowLaunch is a privacy-preserving token launchpad built on Aleo that eliminates unfair advantages in token sales through cryptographic commit-reveal mechanisms and zero-knowledge proofs.

---

## The Problem

Traditional token launches suffer from:
- **Front-running** — MEV bots detect pending transactions and jump ahead
- **Sniping** — Bots monitor mempool and snipe launches at the exact second
- **Whale manipulation** — Large participants can see others' commitments and adjust
- **Information asymmetry** — Some participants have unfair timing advantages

**Result:** Retail users consistently get worse allocations than sophisticated actors.

---

## Our Solution

ShadowLaunch uses a **two-phase commit-reveal scheme** powered by Aleo's zero-knowledge infrastructure:

### Phase 1: Commit (Hidden Bids)
- Contributors submit **sealed commitments** (hash of amount + secret)
- Nobody knows how much others are committing
- All bids are hidden until the commit phase ends

### Phase 2: Reveal (Fair Allocation)
- Contributors reveal their commitments by providing their secret
- Smart contract verifies the hash matches
- Tokens distributed **proportionally** based on revealed amounts

**Result:** Every participant gets fair treatment regardless of timing or resources.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Private Commitments** | Your bid amount is hidden until everyone reveals |
| **Anti-Whale Protection** | Max contribution limits prevent domination |
| **Soft/Hard Caps** | Flexible fundraising targets with automatic refunds |
| **On-Chain Verification** | All logic runs on Aleo smart contracts |
| **Leo Wallet Integration** | Seamless wallet connection and transactions |
| **Real-Time Status** | Live updates on launch progress and phases |

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        SHADOWLAUNCH FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CREATE          2. COMMIT           3. REVEAL      4. CLAIM │
│  ────────          ────────           ────────      ────────    │
│                                                                 │
│  Creator sets      Users submit       Users reveal   Tokens     │
│  launch params     sealed bids        their secrets  distributed│
│  on-chain          (hash only)        (verify hash)  fairly     │
│                                                                 │
│  [Token Info]      [Amount+Secret]    [Secret]       [Tokens]   │
│       │                  │                │              │      │
│       ▼                  ▼                ▼              ▼      │
│  ┌─────────┐        ┌─────────┐      ┌─────────┐   ┌─────────┐  │
│  │ Deploy  │───────▶│ Hidden  │─────▶│ Verify  │──▶│ Allocate│  │
│  │ Launch  │        │ Commits │      │ & Count │   │ Tokens  │  │
│  └─────────┘        └─────────┘      └─────────┘   └─────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Aleo (Leo smart contracts) |
| **Frontend** | Next.js 14, React, TailwindCSS |
| **Backend** | Express.js, Prisma ORM |
| **Database** | SQLite (development) |
| **Wallet** | Leo Wallet Adapter |
| **Styling** | Framer Motion, Custom Cyber Theme |

---

## Project Structure

```
shadowlaunch/
├── apps/
│   ├── api/                 # Express.js backend
│   │   ├── src/
│   │   │   ├── routes/      # API endpoints
│   │   │   ├── services/    # Business logic
│   │   │   └── middleware/  # Auth, validation
│   │   └── prisma/          # Database schema
│   │
│   └── web/                 # Next.js frontend
│       └── src/
│           ├── app/         # Pages (create, launch, dashboard)
│           ├── components/  # UI components
│           └── lib/         # Utilities
│
├── contracts/               # Leo smart contracts
│   └── src/
│       └── main.leo         # ShadowLaunch program
│
└── packages/
    ├── sdk/                 # Shared utilities
    └── ui/                  # Shared components
```

---

## Smart Contract

The `shadowlaunch_v1.aleo` program implements:

```leo
// Core transitions
transition create_launch(...)     // Deploy new token launch
transition commit(...)            // Submit sealed bid
transition reveal(...)            // Reveal commitment
transition end_reveal_phase(...)  // Finalize and distribute

// Privacy features
- Commitment hashing (BHP256)
- Address privacy (hashed storage)
- Amount hiding until reveal
```

**Key Mappings:**
- `launch_phase` — Current phase (commit/reveal/distribution)
- `commitments` — Commitment hash → exists
- `reveals` — User reveal status
- `total_revealed` — Aggregate revealed amount

---

## Getting Started

### Prerequisites
- Node.js 18+
- Leo Wallet browser extension
- Aleo testnet credits (get from [faucet](https://faucet.aleo.org))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/shadowlaunch.git
cd shadowlaunch

# Install dependencies
npm install

# Set up environment
cp apps/web/.env.example apps/web/.env.local

# Initialize database
cd apps/api && npx prisma db push

# Start development servers
npm run dev
```

### Running the App

```bash
# Terminal 1: Start API server (port 3014)
cd apps/api && npm run dev

# Terminal 2: Start web app (port 3004)
cd apps/web && npm run dev
```

Visit `http://localhost:3004` and connect your Leo Wallet.

---

## Demo Flow

1. **Connect Wallet** — Click "Connect" and approve in Leo Wallet
2. **Create Launch** — Fill out token details, set caps and timing
3. **Deploy On-Chain** — Sign the transaction to create launch on Aleo
4. **Share Link** — Send the launch URL to your community
5. **Commit Phase** — Participants submit sealed bids
6. **Reveal Phase** — Participants reveal their secrets
7. **Distribution** — Tokens allocated proportionally

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/launches` | Create new launch |
| `GET` | `/api/launches` | List all launches |
| `GET` | `/api/launches/:id` | Get launch details |
| `PATCH` | `/api/launches/:id` | Update on-chain status |
| `POST` | `/api/commits/prepare` | Prepare commitment |
| `POST` | `/api/reveals/prepare` | Prepare reveal |

---

## Security Considerations

- **Commitment Binding:** Once committed, amount cannot be changed
- **Secret Entropy:** Users must use strong random secrets
- **Timing:** Block height used for phase transitions (not timestamps)
- **Overflow Protection:** All arithmetic checked for overflow

---

## Future Roadmap

- [ ] Credits escrow (lock ALEO during commit)
- [ ] ARC-21 token integration for distribution
- [ ] Multi-chain bridge support
- [ ] Mobile wallet support
- [ ] Governance for launch curation

---

## Built For

**Aleo Hackathon 2025** — Privacy-Preserving DeFi Track

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>ShadowLaunch</strong> — Fair launches for everyone.
</p>
