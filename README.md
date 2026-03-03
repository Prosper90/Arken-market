# Arken — On-Chain Prediction Markets on Telegram

Arken is a full-stack prediction market platform delivered as a **Telegram Mini-App**. Users discover markets, place bets with crypto, and collect winnings — all without leaving Telegram. Admins and community members can create markets, and a multi-oracle system (AI, manual, UMA, Polymarket) handles automated resolution.

---

## What it does

- **Prediction markets inside Telegram.** The app runs as a native Telegram Mini-App, so users never leave the chat. No wallet extension. No separate website needed.
- **Place bets with crypto.** Users deposit SOL, USDC (Solana), or USDC (Arbitrum) into a custodial in-app balance, then place bets on live markets.
- **Community market creation.** Any user can submit a market. Admins review and approve it. The creator earns a fee cut from every bet placed on their market.
- **Automated resolution.** Markets are resolved by one of four oracle types: AI (Claude), UMA protocol, Polymarket price feed, or manual admin review.
- **Referral rewards.** A built-in referral system pays the referring user a percentage of fees on each bet placed by someone they brought in.
- **Real-time updates.** Market prices, bet activity, and position updates stream live via WebSocket.
- **Admin dashboard.** A separate web panel lets admins manage markets, view users, configure fees, approve/reject user-submitted markets, and monitor platform activity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mini-App Frontend | React 18 + Vite, served via nginx |
| Admin Panel | React (CRA) |
| API / Auth Service | Node.js + Express |
| Bot & Consumer Service | Node.js (Telegram Bot API, grammy) |
| Market & Socket Service | Node.js + Socket.io |
| Message Queue | RabbitMQ |
| Cache | Redis |
| Database | MongoDB (Atlas) |
| Blockchain — Solana | `@solana/web3.js`, SPL Token |
| Blockchain — EVM (Arbitrum) | ethers.js v6 |
| AI Oracle | Anthropic Claude API |
| Containerisation | Docker + Docker Compose |
| Reverse Proxy / SSL | Nginx + Certbot (Let's Encrypt) |

---

## Architecture

```
                        Telegram Client
                               │
                        ┌──────▼──────┐
                        │  Nginx host │  SSL termination
                        └──────┬──────┘
               ┌───────────────┴──────────────┐
               │                              │
       ┌───────▼────────┐             ┌───────▼────────┐
       │   mini-app     │             │  admin-panel   │
       │ (React, :3000) │             │ (React, :3001) │
       │  internal nginx│             └────────────────┘
       └──┬─────────┬───┘
          │         │
       /api/    /socket.io/
          │         │
  ┌───────▼──┐  ┌───▼──────────────┐
  │   auth-  │  │  market-service  │
  │  service │  │  Socket.io + cron│
  │  (:4000) │  │      (:3003)     │
  └────┬─────┘  └────────┬─────────┘
       │                 │
       └────────┬────────┘
                │
          ┌─────▼──────┐     ┌──────────┐
          │  RabbitMQ  │     │  Redis   │
          └─────┬──────┘     └──────────┘
                │
        ┌───────▼────────┐
        │   bot-service  │
        │  (consumer-1)  │
        │  Telegram bot  │
        └───────┬────────┘
                │
        MongoDB Atlas (shared across all services)
```

### Services

| Service | Folder | Role |
|---|---|---|
| `auth-service` | `arken_backend-main` | REST API, user auth (JWT), RabbitMQ producer |
| `bot-service` | `arken_service_consumer-1-main` | Telegram bot, RabbitMQ consumer, wallet sweeping, withdrawals |
| `market-service` | `arken_service_consumer-2-main` | Market data, bet resolution cron, Socket.io, oracle integrations |
| `mini-app` | `arken_front-main` | Telegram Mini-App (Vite build → nginx) |
| `admin-panel` | `arken_admin-main` | Web admin dashboard |
| `rabbitmq` | Docker image | Message broker between services |
| `redis` | Docker image | Session cache, rate limiting |

---

## Key Features in Depth

### Prediction Markets
- Binary (Yes/No) outcome markets with configurable end dates
- Outcomes priced between 0–1 (implied probability)
- Live price updates as bets are placed
- Private markets (allowlist by Telegram ID) for communities

### Oracle Resolution System
Four resolution modes configurable per market:
- **Manual** — admin reviews and picks the winning outcome
- **AI** — Claude API is called at close time; it reads the market question and resolves based on publicly available information
- **UMA** — outcome disputed/resolved via the UMA optimistic oracle protocol
- **Polymarket** — mirrors resolution from the corresponding Polymarket market

### Crypto Wallet System
- Custodial in-app balance (`userPublicWallet.balance`) as single source of truth
- Auto-generated per-user deposit wallets (Solana + Arbitrum)
- Background cron sweeps incoming deposits from user wallets into the platform treasury
- Withdrawals send directly from the admin treasury wallet (keys stored in env vars, never in DB)
- Fee breakdown per bet: platform fee + oracle fee + referrer cut + creator cut

### Referral System
- Each user gets a unique referral link
- When a referred user places a bet, the referrer earns a percentage of the platform fee
- Market creators earn a separate creator fee from bets on their markets

### Real-time Data
- Socket.io on `market-service` broadcasts bet events and price changes
- Frontend subscribes on connect; no polling

---

## Running Locally with Docker

```bash
# 1. Clone the repo
git clone https://github.com/your-org/arken.git
cd arken

# 2. Fill in .env files for each service (see DEPLOYMENT.md for all vars)
cp arken_backend-main/.env.example arken_backend-main/.env
# ... edit each .env with your keys

# 3. Start everything
docker compose up -d --build

# 4. Check services
docker compose ps
docker compose logs -f
```

Services will be available at:
- Mini-app: http://localhost:3000
- Admin panel: http://localhost:3001
- API: http://localhost:4000
- RabbitMQ management: http://localhost:15672 (admin / admin)

> Full production deployment instructions (Digital Ocean, Nginx, SSL, DNS) are in [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Environment Variables

Each service has its own `.env`. Key variables:

| Service | Critical vars |
|---|---|
| auth-service | `DB_URL`, `JWT_TOKEN_SECRET`, `RABBITMQ_URL` |
| bot-service | `BOT_TOKEN`, `SOLFLARE_PRIVATE_KEY`, `EVM_PRIVATE_KEY`, `SOL_RPC_URL`, `ARB_RPC_URL` |
| market-service | `ANTHROPIC_API_KEY`, `POLYMARKET_URL`, `DB_URL` |
| mini-app | `VITE_FRONT_URL`, `VITE_BOT_URL` |
| admin-panel | `REACT_APP_APISERVICE_MAIN`, `REACT_APP_siteUrl` |

See [DEPLOYMENT.md §7](./DEPLOYMENT.md#7-configure-environment-variables) for the full list.

---

## Project Structure

```
arken/
├── arken_backend-main/          # Auth + REST API service
│   ├── routes/
│   ├── controllers/
│   ├── queue/                   # RabbitMQ publisher
│   └── index.js
├── arken_service_consumer-1-main/  # Bot service (consumer)
│   ├── services/auth.service.js    # Core business logic (~6000 lines)
│   ├── models/
│   ├── consumers/
│   └── cronresolution.js
├── arken_service_consumer-2-main/  # Market service (consumer)
│   ├── services/auth.service.js
│   ├── models/
│   ├── socket.js
│   └── cron.js
├── arken_front-main/            # Telegram Mini-App
│   ├── src/
│   ├── nginx.conf               # Internal proxy config
│   └── Dockerfile               # Multi-stage: Vite build → nginx
├── arken_admin-main/            # Admin dashboard
│   └── src/
├── docker-compose.yml
├── DEPLOYMENT.md                # Production deployment guide
└── README.md
```

---

## License

Private — all rights reserved.
