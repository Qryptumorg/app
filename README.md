# Qryptum App

[![License: MIT](https://img.shields.io/badge/License-MIT-white.svg)](LICENSE)

Frontend dApp for the Qryptum protocol, built with React, Vite, and TypeScript.

## What it does

Qryptum lets users shield ERC-20 tokens into their personal QRYPTANK vault, protected by a cryptographic vault proof. Shielded tokens become non-transferable qTokens that can only move via the Qryptum app with the correct vault proof.

## Tech Stack

- React 19 with TypeScript
- Vite for bundling
- Tailwind CSS for styling
- wagmi and viem for Ethereum interaction
- WalletConnect for wallet support
- TanStack Query for data fetching
- Recharts for balance charts

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

## DEV_MOCK mode

Set `VITE_DEV_MOCK=true` in your `.env` to run the app with 10 mock tokens and simulated transactions, no wallet or contract needed.

Set to `false` to connect to real deployed contracts.

## Environment Variables

| Variable | Description |
|---|---|
| VITE_WALLETCONNECT_PROJECT_ID | From cloud.walletconnect.com |
| VITE_ALCHEMY_SEPOLIA_URL | Alchemy RPC for Sepolia |
| VITE_ALCHEMY_MAINNET_URL | Alchemy RPC for Mainnet |
| VITE_SHIELD_FACTORY_SEPOLIA | ShieldFactory contract address on Sepolia |
| VITE_SHIELD_FACTORY_MAINNET | ShieldFactory contract address on Mainnet |
| VITE_API_URL | Backend API base URL |
| VITE_DEV_MOCK | Set to true for mock mode, false for live contracts |

## Build

```bash
npm run build
```

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-white.svg)](LICENSE)

Copyright (c) 2026 [wei-zuan](https://github.com/wei-zuan). See [LICENSE](LICENSE) for full terms.
