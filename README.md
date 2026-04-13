# Qryptum App

[![License: MIT](https://img.shields.io/badge/License-MIT-white.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vite.dev)
[![Network](https://img.shields.io/badge/Network-Sepolia-orange.svg)](https://sepolia.etherscan.io)

Frontend dApp for the Qryptum protocol. Three transfer modes, one vault.

---

## Transfer Modes

### QryptSafe (OTP Chain)
Shield ERC-20 tokens into your personal Qrypt-Safe vault. Each operation consumes one proof from a deterministic one-way hash chain. Used proofs cannot be replayed: even if visible in transaction calldata, the previous proof cannot be computed from it.

### QryptShield (Railgun ZK Pool)
Atomic vault-to-Railgun transfer using zero-knowledge proofs. The sender shields tokens from their vault directly into the Railgun privacy pool. The recipient unshields to any address with no on-chain link to the sender.

### QryptAir (EIP-712 Offline Voucher)
The vault owner signs a typed voucher offline and generates a QR code. The recipient scans the code and redeems on-chain. The sender never broadcasts a transaction to initiate the transfer. Funds come from an isolated `airBudget`, separate from the main shielded balance.

---

## Tech Stack

- React 19 with TypeScript
- Vite 6 for bundling
- Tailwind CSS for styling
- wagmi v3 + viem v2 for Ethereum interaction
- Reown AppKit (WalletConnect) for wallet support
- TanStack Query for data fetching
- Railgun SDK 10.8.4 for ZK privacy pool
- snarkjs for Groth16 ZK proof generation in browser
- level-js for IndexedDB persistence (Railgun wallet state)

---

## Active Contracts (Sepolia)

| Contract | Address |
|---|---|
| QryptSafeV6 factory | `0x04E4d410646a6c5268E003121023111e6328DA59` |
| PersonalQryptSafeV6 impl | `0x9b3F78B4abc41cf2c1C5E85F9c79789d5c99d1ca` |
| qUSDC (6 decimals) | `0x71f6fC3c252250F7602639B0D5458f8D682115d4` |

V5 legacy factory (still on Sepolia, triggers upgrade banner in UI): `0x291295B88fC35dcA3208f7cCC3DFc1a2921167E8`

---

## Development

```bash
cp .env.example .env
# Fill in required environment variables
npm install
npm run dev
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_REOWN_PROJECT_ID` | Reown (WalletConnect) project ID from cloud.reown.com |
| `VITE_ALCHEMY_SEPOLIA_URL` | Alchemy RPC URL for Sepolia (Railgun SDK) |
| `VITE_ALCHEMY_MAINNET_URL` | Alchemy RPC URL for Mainnet (optional) |
| `VITE_SHIELD_FACTORY_SEPOLIA` | V6 factory: `0x04E4d410646a6c5268E003121023111e6328DA59` |
| `VITE_SHIELD_FACTORY_V5_SEPOLIA` | V5 factory for legacy vault detection |
| `VITE_SHIELD_FACTORY_MAINNET` | Set after mainnet deploy |
| `VITE_API_URL` | Backend API base URL |

---

## Build

```bash
npm run build
```

---

## Key Architecture Notes

- OTP chain proofs stored in localStorage by wallet address and position. Never use position 0 (H0) in normal operations: it is the recharge key.
- `snarkjs.min.js` loaded via `<script src="/snarkjs.min.js">` in `index.html` before the ES module bundle. This ordering is required for Groth16 to work correctly.
- ZK circuit artifacts (~10MB) downloaded from IPFS and cached in IndexedDB via `qryptum-artifacts`.
- Railgun wallet state (Merkle tree, encrypted keys) persisted in IndexedDB via `level-js`.
- All transactions verified with `receipt.status === "reverted"` check before marking as success.

---

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-white.svg)](LICENSE)

Copyright (c) 2024-2026 Qryptum. See [LICENSE](LICENSE) for full terms.

<!--rebuild:1776115905103-->