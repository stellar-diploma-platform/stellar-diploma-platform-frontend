# Stellar Diploma Platform — Frontend

A Next.js frontend for a decentralized academic credential platform built on **Stellar + Soroban**. Universities issue tamper-proof, non-transferable diplomas as Soulbound NFTs. Students own their credentials on-chain. Employers verify authenticity instantly via QR code or token ID.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State:** Zustand
- **HTTP:** Axios
- **QR:** `qrcode` (generate) + `qr-scanner` (scan)
- **Notifications:** react-hot-toast

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set the backend URL in your environment:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## Project Structure

```
app/
├── page.tsx                        # Landing / home
├── auth/
│   ├── login/                      # University login
│   └── register/                   # University registration
├── university/
│   ├── dashboard/                  # Stats overview
│   ├── issue-diploma/              # Issue a single diploma
│   ├── batch-upload/               # Bulk CSV issuance
│   └── revoke/                     # Revoke a diploma
├── student/
│   ├── wallet-connect/             # Connect Stellar wallet
│   └── my-certificates/            # View owned diplomas
└── verify/
    ├── search/                     # Search by token ID
    ├── qr-scan/                    # Camera QR scanner
    └── result/                     # Verification result

lib/
├── api.ts      # Axios client + API helpers
├── types.ts    # Shared TypeScript types
└── store.ts    # Zustand auth store
```

---

## Key Features

**University portal** — register, log in, issue diplomas individually or via CSV batch upload, revoke credentials, view dashboard stats.

**Student portal** — connect a Stellar wallet, view all on-chain diploma NFTs associated with the wallet.

**Verification portal** — verify any diploma by token ID (search) or by scanning a QR code with the device camera. Returns issuer accreditation status, revocation status, and full credential metadata.

---

## API Integration

The `lib/api.ts` module exports typed helpers for every endpoint:

```ts
authApi.register(...)   // POST /auth/register
authApi.login(...)      // POST /auth/login

universityApi.list()    // GET  /universities
universityApi.stats()   // GET  /universities/me/stats
universityApi.approve() // PATCH /universities/:id/approve

diplomaApi.issue(...)   // POST /diplomas
diplomaApi.list()       // GET  /diplomas
diplomaApi.revoke()     // PATCH /diplomas/:tokenId/revoke
diplomaApi.batch(file)  // POST /diplomas/batch (CSV)

verifyApi.verify(id)    // GET  /verify/:tokenId  (public)
```

JWT tokens are stored in `localStorage` and attached automatically via an Axios request interceptor.

---

## Auth State

`useAuthStore` (Zustand) manages the logged-in university session:

```ts
const { university, setAuth, logout, hydrate } = useAuthStore();
```

Call `hydrate()` on app mount to restore the session from `localStorage`.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Related

- [Project spec & architecture](./project.md)
- [Backend flow](./backend-flow.md)
- [Full structure reference](./structure.md)
