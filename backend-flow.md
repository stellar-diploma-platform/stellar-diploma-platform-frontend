# Backend Flow — Frontend Integration Reference

Everything the frontend needs to know about what is implemented, how to call it, and what to expect back.

---

## Base URL & Global Config

```
Base URL:     http://localhost:3000/api/v1
Swagger UI:   http://localhost:3000/docs
CORS:         Enabled for all origins
Validation:   Strict — unknown fields are stripped, types are coerced
```

All authenticated requests require:
```
Authorization: Bearer <access_token>
```

---

## Auth — `/api/v1/auth`

### POST `/auth/register`
Register a new university. Account starts as `PENDING` — cannot issue diplomas until approved.

**Request body:**
```json
{
  "name": "MIT University",
  "email": "admin@mit.edu",
  "password": "securepassword",   // min 8 chars
  "walletAddress": "GABCD...XYZ"  // Stellar public key
}
```

**Response `201`:**
```json
{
  "message": "Registration successful. Awaiting accreditation approval.",
  "id": "uuid"
}
```

**Errors:** `409` email already registered | `409` wallet already registered

---

### POST `/auth/login`
Login and receive a JWT.

**Request body:**
```json
{
  "email": "admin@mit.edu",
  "password": "securepassword"
}
```

**Response `200`:**
```json
{
  "access_token": "eyJhbGci...",
  "university": {
    "id": "uuid",
    "name": "MIT University",
    "email": "admin@mit.edu",
    "walletAddress": "GABCD...XYZ",
    "accredited": false,
    "status": "PENDING"   // "PENDING" | "APPROVED" | "REMOVED"
  }
}
```

**Errors:** `401` invalid credentials

---

### GET `/auth/me` 🔒
Returns the currently authenticated university (no password hash).

**Response `200`:** Same shape as `university` object in login response.

---

## Universities — `/api/v1/universities`

### GET `/universities`
Public. Returns all universities (no password hash exposed).

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "name": "MIT University",
    "email": "admin@mit.edu",
    "walletAddress": "GABCD...XYZ",
    "accredited": true,
    "status": "APPROVED",
    "createdAt": "2026-05-17T10:00:00.000Z"
  }
]
```

---

### GET `/universities/:id`
Public. Get a single university by ID.

**Response `200`:** Same shape as above (single object).

**Errors:** `404` not found

---

### PATCH `/universities/:id/approve` 🔒
Admin action. Registers the university on-chain (Soroban registry contract) and sets `status: APPROVED`, `accredited: true` in the database.

**Response `200`:**
```json
{
  "id": "uuid",
  "name": "MIT University",
  "accredited": true,
  "status": "APPROVED"
}
```

**Errors:** `404` not found

---

### DELETE `/universities/:id/accreditation` 🔒
Admin action. Removes university from on-chain registry and sets `status: REMOVED`, `accredited: false`.

**Response `200`:**
```json
{
  "id": "uuid",
  "name": "MIT University",
  "accredited": false,
  "status": "REMOVED"
}
```

---

### GET `/universities/me/stats` 🔒
Returns diploma counts for the authenticated university.

**Response `200`:**
```json
{
  "total": 120,
  "active": 115,
  "revoked": 5
}
```

---

## Diplomas — `/api/v1/diplomas`

All diploma endpoints require authentication. The university must have `accredited: true` to issue.

### POST `/diplomas` 🔒
Issue a single diploma NFT.

**What happens internally:**
1. Builds metadata JSON and pins it to IPFS via Pinata
2. Calls `mint(university, student, degree, metadataUri)` on the Soroban diploma contract
3. Stores the returned `tokenId` + all fields in PostgreSQL

**Request body:**
```json
{
  "studentWallet": "GXYZ...STUDENT",
  "studentName": "John Doe",
  "degree": "BSc",        // max 9 characters (Soroban Symbol limit)
  "major": "Computer Science"  // optional
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "tokenId": "42",          // BigInt serialized as string
  "studentWallet": "GXYZ...STUDENT",
  "studentName": "John Doe",
  "degree": "BSc",
  "major": "Computer Science",
  "metadataHash": "QmXxx...",   // IPFS CID
  "metadataUri": "ipfs://QmXxx...",
  "revoked": false,
  "issuedAt": "2026-05-17T11:00:00.000Z",
  "universityId": "uuid"
}
```

**Errors:** `403` university not accredited | `404` university not found

---

### GET `/diplomas` 🔒
List all diplomas issued by the authenticated university, ordered newest first.

**Response `200`:** Array of diploma objects (same shape as issue response).

---

### PATCH `/diplomas/:tokenId/revoke` 🔒
Revoke a diploma. Only the issuing university can revoke. Calls `revoke(university, tokenId)` on-chain then updates the DB.

`:tokenId` is an integer (e.g. `/diplomas/42/revoke`).

**Response `200`:** Updated diploma object with `"revoked": true`.

**Errors:** `404` diploma not found | `403` not your diploma | `400` already revoked

---

### POST `/diplomas/batch` 🔒
Batch issue diplomas from a CSV file upload.

**Request:** `multipart/form-data` with field name `file`.

**CSV format:**
```csv
studentWallet,studentName,degree,major
GXYZ...1,John Doe,BSc,Computer Science
GXYZ...2,Jane Smith,MBA,Business
```

**Response `200`:** Array of results — each row either succeeded or failed independently:
```json
[
  { "success": true, "tokenId": "42", "studentName": "John Doe", ... },
  { "success": false, "studentWallet": "GXYZ...2", "error": "University not accredited" }
]
```

---

## Verification — `/api/v1/verify`

### GET `/verify/:tokenId`
**Public — no authentication required.** Verifies a diploma by token ID.

**What happens internally:**
1. Calls `verify(tokenId)` on the Soroban diploma contract (read-only simulation)
2. Logs the verification attempt (IP address recorded) in `verification_logs`
3. If valid, fetches full diploma + university details from the database

`:tokenId` is an integer (e.g. `/verify/42`).

**Response `200` — valid diploma:**
```json
{
  "valid": true,
  "diploma": {
    "tokenId": "42",
    "studentName": "John Doe",
    "studentWallet": "GXYZ...STUDENT",
    "degree": "BSc",
    "major": "Computer Science",
    "metadataUri": "ipfs://QmXxx...",
    "issuedAt": "2026-05-17T11:00:00.000Z",
    "revoked": false,
    "university": {
      "name": "MIT University",
      "walletAddress": "GABCD...XYZ",
      "accredited": true
    }
  }
}
```

**Response `200` — invalid or revoked:**
```json
{
  "valid": false,
  "message": "Invalid or revoked diploma"
}
```

**Errors:** `404` diploma exists on-chain but not in database

---

## IPFS Metadata Structure

When a diploma is issued, the following JSON is pinned to IPFS:

```json
{
  "name": "BSc - John Doe",
  "description": "Official Soulbound Diploma NFT",
  "attributes": [
    { "trait_type": "Institution", "value": "MIT University" },
    { "trait_type": "Degree", "value": "BSc" },
    { "trait_type": "Major", "value": "Computer Science" },
    { "trait_type": "Student", "value": "John Doe" },
    { "trait_type": "Issue Date", "value": "2026-05-17T11:00:00.000Z" }
  ]
}
```

To resolve the metadata for display, convert `ipfs://QmXxx...` to:
```
https://gateway.pinata.cloud/ipfs/QmXxx...
```

---

## Blockchain Contracts

Two Soroban contracts are in use:

| Contract | Env Var | Purpose |
|---|---|---|
| Diploma Contract | `DIPLOMA_CONTRACT_ID` | `mint`, `verify`, `revoke`, `get_diploma` |
| Registry Contract | `REGISTRY_CONTRACT_ID` | `register`, `approve`, `remove`, `is_approved` |

The backend signs all on-chain transactions using `ADMIN_SECRET_KEY`. The frontend does **not** need to interact with the blockchain directly — all contract calls go through the backend.

---

## University Status Flow

```
Register → PENDING → (admin approves) → APPROVED → can issue diplomas
                   → (admin removes)  → REMOVED  → cannot issue diplomas
```

The frontend should gate the diploma issuance UI on `university.status === "APPROVED"`.

---

## Error Shape

All errors follow NestJS default format:

```json
{
  "statusCode": 403,
  "message": "University not accredited",
  "error": "Forbidden"
}
```

Validation errors return an array:
```json
{
  "statusCode": 400,
  "message": ["degree must be shorter than or equal to 9 characters"],
  "error": "Bad Request"
}
```

---

## Notes for Frontend

- `tokenId` is always returned as a **string** (serialized from BigInt). Parse with `BigInt()` if needed for math, or use as-is for display and URL params.
- The `degree` field has a **9-character max** enforced by the Soroban Symbol type. Show a character counter in the form.
- Batch CSV upload uses `multipart/form-data` with the field name exactly `file`.
- The `/verify/:tokenId` endpoint is safe to call from a public-facing page with no token — it logs the IP but requires no auth.
- Swagger docs at `/docs` can be used to test all endpoints interactively.
