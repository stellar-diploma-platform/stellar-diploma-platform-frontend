# Frontend Implementation Flow

A page-by-page breakdown of what was built in the Next.js frontend.

---

## Landing Page — `/`

- Hero section with tagline and gradient background
- Four entry-point buttons routing to:
  - University Login
  - University Registration
  - Verify Diploma (public)
  - Student Portal

---

## Auth

### Register — `/auth/register`

- Form: university name, email, password, Stellar wallet address
- Calls `POST /auth/register`
- On success: redirects to login with a toast noting approval is pending
- Validation errors from the API are surfaced inline

### Login — `/auth/login`

- Form: email + password
- Calls `POST /auth/login`
- On success: stores JWT + university object via `useAuthStore.setAuth()`, redirects to dashboard
- Link to register page

---

## University Portal — `/university/*`

Protected by a layout that:
- Calls `hydrate()` on mount to restore session from `localStorage`
- Redirects to `/auth/login` if no token is found
- Renders a persistent sidebar with: university name, accreditation status badge, nav links (Dashboard, Issue Diploma, Batch Upload, Revoke), and a Logout button
- Active nav link is highlighted

### Dashboard — `/university/dashboard`

- Warning banner if university status is not `APPROVED`
- Stats cards: Total Issued, Active, Revoked (from `GET /universities/me/stats`)
- Table of all issued diplomas (from `GET /diplomas`) with columns: Token ID, Student, Degree, Issued date, Status badge
- Inline Revoke button per active diploma — calls `PATCH /diplomas/:tokenId/revoke` and updates state optimistically

### Issue Diploma — `/university/issue-diploma`

- Blocked with a warning if university is not `APPROVED`
- Form: student wallet address, student name, degree (max 9 chars with live counter), major (optional)
- Client-side validation: degree length ≤ 9 characters
- Calls `POST /diplomas`
- On success: shows token ID in toast, redirects to dashboard

### Batch Upload — `/university/batch-upload`

- Blocked with a warning if university is not `APPROVED`
- CSV format hint: `studentWallet,studentName,degree,major`
- File input (`.csv` only) + upload button
- Calls `POST /diplomas/batch` with `multipart/form-data`
- Results list: each row shows student name/wallet and either the issued token ID or the error message, color-coded green/red

### Revoke — `/university/revoke`

- Lists all active (non-revoked) diplomas
- Each row: student name, token ID, degree, issue date, Revoke button
- Calls `PATCH /diplomas/:tokenId/revoke`
- Updates list in place on success; per-row loading state prevents double-clicks

---

## Student Portal — `/student/*`

### Wallet Connect — `/student/wallet-connect`

- Detects `window.freighter` (Freighter browser extension)
- If not installed: shows install link to `freighter.app`
- Connect button calls `freighter.getPublicKey()` and displays the returned public key
- Connected state: shows wallet address, link to My Certificates, Disconnect button

### My Certificates — `/student/my-certificates`

- Token ID lookup form — calls `GET /verify/:tokenId` (public endpoint)
- Renders a diploma card on success:
  - Student name, degree + major, token ID, institution name, issue date, wallet address
  - Valid / Revoked status badge
  - Link to shareable verification URL (`/verify/result?tokenId=...`)
  - Link to IPFS metadata (resolves `ipfs://` via Pinata gateway)

---

## Verification Portal — `/verify/*`

All pages are fully public — no authentication required.

### Search — `/verify/search`

- Token ID input + Verify button
- Submits to `/verify/result?tokenId=<id>`
- Link to QR scan page

### QR Scan — `/verify/qr-scan`

- **Image upload**: file input triggers `qr-scanner` (`QrScanner.scanImage`) to decode the QR from an uploaded image
- **Manual input**: paste a verification URL or raw token ID; regex extracts the numeric token ID from patterns like `/diploma/42`, `/verify/42`, `?tokenId=42`, or a bare number
- Both paths redirect to `/verify/result?tokenId=<id>`

### Result — `/verify/result`

- Reads `tokenId` from query string via `useSearchParams` (wrapped in `<Suspense>`)
- Calls `GET /verify/:tokenId`
- **Valid diploma**: green border card showing student name, degree, institution, accreditation status, issue date, wallet address, optional IPFS metadata link
- **Invalid/revoked**: red border card with the reason message
- Buttons to verify another or scan a QR

---

## Shared Infrastructure

### `lib/api.ts`
- Axios instance pointed at `NEXT_PUBLIC_API_URL`
- Request interceptor attaches `Authorization: Bearer <token>` from `localStorage`
- Exported API groups: `authApi`, `universityApi`, `diplomaApi`, `verifyApi`

### `lib/store.ts`
- Zustand store: `university`, `token`, `setAuth`, `logout`, `hydrate`
- `setAuth` persists to `localStorage`; `hydrate` restores on mount

### `lib/types.ts`
- `University`, `Diploma`, `VerifyResult`, `UniversityStats`, `BatchResult`

### Notifications
- `react-hot-toast` used throughout for success/error feedback
- Toaster mounted in root layout
