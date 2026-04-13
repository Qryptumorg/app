// ─────────────────────────────────────────────────────────────────────────────
// V5 ABIs (active in frontend until Phase 3 migration)
// ─────────────────────────────────────────────────────────────────────────────

export const SHIELD_FACTORY_ABI = [
    {
        type: "function",
        name: "createVault",
        inputs: [{ name: "passwordHash", type: "bytes32", internalType: "bytes32" }],
        outputs: [{ name: "vault", type: "address", internalType: "address" }],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "hasVault",
        inputs: [{ name: "wallet", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "getVault",
        inputs: [{ name: "wallet", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "paused",
        inputs: [],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view"
    },
    {
        type: "event",
        name: "VaultCreated",
        inputs: [
            { name: "owner", type: "address", indexed: true, internalType: "address" },
            { name: "vault", type: "address", indexed: true, internalType: "address" }
        ]
    }
] as const;

export const PERSONAL_VAULT_ABI = [
    {
        type: "function",
        name: "shield",
        inputs: [
            { name: "tokenAddress", type: "address", internalType: "address" },
            { name: "amount", type: "uint256", internalType: "uint256" },
            { name: "proofHash", type: "bytes32", internalType: "bytes32" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "unshield",
        inputs: [
            { name: "tokenAddress", type: "address", internalType: "address" },
            { name: "amount", type: "uint256", internalType: "uint256" },
            { name: "proofHash", type: "bytes32", internalType: "bytes32" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "unshieldToRailgun",
        inputs: [
            { name: "tokenAddress", type: "address", internalType: "address" },
            { name: "amount", type: "uint256", internalType: "uint256" },
            { name: "proofHash", type: "bytes32", internalType: "bytes32" },
            { name: "railgunProxy", type: "address", internalType: "address" },
            { name: "shieldCalldata", type: "bytes", internalType: "bytes" }
        ],
        outputs: [],
        stateMutability: "payable"
    },
    {
        type: "function",
        name: "commitTransfer",
        inputs: [{ name: "commitHash", type: "bytes32", internalType: "bytes32" }],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "revealTransfer",
        inputs: [
            { name: "tokenAddress", type: "address", internalType: "address" },
            { name: "to", type: "address", internalType: "address" },
            { name: "amount", type: "uint256", internalType: "uint256" },
            { name: "proofHash", type: "bytes32", internalType: "bytes32" },
            { name: "nonce", type: "uint256", internalType: "uint256" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "changeVaultProof",
        inputs: [
            { name: "oldHash", type: "bytes32", internalType: "bytes32" },
            { name: "newHash", type: "bytes32", internalType: "bytes32" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "emergencyWithdraw",
        inputs: [{ name: "tokenAddresses", type: "address[]", internalType: "address[]" }],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "getQTokenAddress",
        inputs: [{ name: "tokenAddress", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "getShieldedBalance",
        inputs: [{ name: "tokenAddress", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "qTokens",
        inputs: [{ name: "tokenAddress", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "getEmergencyWithdrawAvailableBlock",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "lastActivityBlock",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "initialized",
        inputs: [],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view"
    },
    {
        type: "event",
        name: "TokenShielded",
        inputs: [
            { name: "token", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
            { name: "qToken", type: "address", indexed: true }
        ]
    },
    {
        type: "event",
        name: "TokenUnshielded",
        inputs: [
            { name: "token", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false }
        ]
    },
    {
        type: "event",
        name: "TransferExecuted",
        inputs: [
            { name: "token", type: "address", indexed: true },
            { name: "to", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false }
        ]
    },
    {
        type: "event",
        name: "CommitSubmitted",
        inputs: [
            { name: "commitHash", type: "bytes32", indexed: true }
        ]
    },
    {
        type: "event",
        name: "VaultProofChanged",
        inputs: []
    },
    {
        type: "event",
        name: "QTokenDeployed",
        inputs: [
            { name: "token", type: "address", indexed: true },
            { name: "qToken", type: "address", indexed: true }
        ]
    },
    {
        type: "event",
        name: "EmergencyWithdraw",
        inputs: [
            { name: "token", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false }
        ]
    },
    {
        type: "function",
        name: "redeemAirVoucher",
        inputs: [
            { name: "token",            type: "address",  internalType: "address"  },
            { name: "amount",           type: "uint256",  internalType: "uint256"  },
            { name: "recipient",        type: "address",  internalType: "address"  },
            { name: "deadline",         type: "uint256",  internalType: "uint256"  },
            { name: "nonce",            type: "bytes32",  internalType: "bytes32"  },
            { name: "transferCodeHash", type: "bytes32",  internalType: "bytes32"  },
            { name: "signature",        type: "bytes",    internalType: "bytes"    }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "usedVoucherNonces",
        inputs: [{ name: "nonce", type: "bytes32", internalType: "bytes32" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view"
    },
    {
        type: "event",
        name: "AirVoucherRedeemed",
        inputs: [
            { name: "nonce",     type: "bytes32", indexed: true  },
            { name: "token",     type: "address", indexed: true  },
            { name: "amount",    type: "uint256", indexed: false },
            { name: "recipient", type: "address", indexed: true  }
        ]
    }
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// V6 ABIs (OTP chain + airBudget isolation)
// Factory and implementation addresses loaded from environment variables.
// ─────────────────────────────────────────────────────────────────────────────

export const SHIELD_FACTORY_V6_ABI = [
    {
        type: "function",
        name: "createQryptSafe",
        inputs: [{ name: "initialChainHead", type: "bytes32", internalType: "bytes32" }],
        outputs: [{ name: "vault", type: "address", internalType: "address" }],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "hasQryptSafe",
        inputs: [{ name: "wallet", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "getQryptSafe",
        inputs: [{ name: "wallet", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view"
    },
    {
        type: "event",
        name: "QryptSafeCreated",
        inputs: [
            { name: "owner", type: "address", indexed: true, internalType: "address" },
            { name: "vault", type: "address", indexed: true, internalType: "address" }
        ]
    }
] as const;

export const PERSONAL_VAULT_V6_ABI = [
    // ── QryptSafe: shield / unshield ─────────────────────────────────────────
    {
        type: "function",
        name: "qrypt",
        inputs: [
            { name: "tokenAddress", type: "address", internalType: "address" },
            { name: "amount",       type: "uint256", internalType: "uint256" },
            { name: "proof",        type: "bytes32", internalType: "bytes32" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "unqrypt",
        inputs: [
            { name: "tokenAddress", type: "address", internalType: "address" },
            { name: "amount",       type: "uint256", internalType: "uint256" },
            { name: "proof",        type: "bytes32", internalType: "bytes32" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    // ── QryptSafe: commit-reveal transfer ────────────────────────────────────
    {
        type: "function",
        name: "veilTransfer",
        inputs: [{ name: "commitHash", type: "bytes32", internalType: "bytes32" }],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "unveilTransfer",
        inputs: [
            { name: "tokenAddress", type: "address", internalType: "address" },
            { name: "to",           type: "address", internalType: "address" },
            { name: "amount",       type: "uint256", internalType: "uint256" },
            { name: "proof",        type: "bytes32", internalType: "bytes32" },
            { name: "nonce",        type: "uint256", internalType: "uint256" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    // ── OTP chain: recharge ──────────────────────────────────────────────────
    {
        type: "function",
        name: "rechargeChain",
        inputs: [
            { name: "newHead",      type: "bytes32", internalType: "bytes32" },
            { name: "currentProof", type: "bytes32", internalType: "bytes32" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    // ── QryptAir: air bags management ─────────────────────────────────────
    {
        type: "function",
        name: "fundAirBags",
        inputs: [
            { name: "token",  type: "address", internalType: "address" },
            { name: "amount", type: "uint256", internalType: "uint256" },
            { name: "proof",  type: "bytes32", internalType: "bytes32" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "reclaimAirBags",
        inputs: [
            { name: "token", type: "address", internalType: "address" },
            { name: "proof", type: "bytes32", internalType: "bytes32" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "claimAirVoucher",
        inputs: [
            { name: "token",            type: "address", internalType: "address" },
            { name: "amount",           type: "uint256", internalType: "uint256" },
            { name: "recipient",        type: "address", internalType: "address" },
            { name: "deadline",         type: "uint256", internalType: "uint256" },
            { name: "nonce",            type: "bytes32", internalType: "bytes32" },
            { name: "transferCodeHash", type: "bytes32", internalType: "bytes32" },
            { name: "signature",        type: "bytes",   internalType: "bytes"   }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    // ── QryptShield: unshield to Railgun ─────────────────────────────────────
    {
        type: "function",
        name: "railgun",
        inputs: [
            { name: "tokenAddress",   type: "address", internalType: "address" },
            { name: "amount",         type: "uint256", internalType: "uint256" },
            { name: "proof",          type: "bytes32", internalType: "bytes32" },
            { name: "railgunProxy",   type: "address", internalType: "address" },
            { name: "shieldCalldata", type: "bytes",   internalType: "bytes"   }
        ],
        outputs: [],
        stateMutability: "payable"
    },
    // ── Emergency withdraw ───────────────────────────────────────────────────
    {
        type: "function",
        name: "emergencyWithdraw",
        inputs: [{ name: "tokenAddresses", type: "address[]", internalType: "address[]" }],
        outputs: [],
        stateMutability: "nonpayable"
    },
    // ── View: balances ───────────────────────────────────────────────────────
    {
        type: "function",
        name: "getQryptedBalance",
        inputs: [{ name: "tokenAddress", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "getAirBags",
        inputs: [{ name: "token", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view"
    },
    // ── View: qToken ─────────────────────────────────────────────────────────
    {
        type: "function",
        name: "getQTokenAddress",
        inputs: [{ name: "tokenAddress", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "qTokens",
        inputs: [{ name: "tokenAddress", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view"
    },
    // ── View: misc ───────────────────────────────────────────────────────────
    {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "address" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "initialized",
        inputs: [],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "lastActivityBlock",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "getEmergencyWithdrawAvailableBlock",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "usedVoucherNonces",
        inputs: [{ name: "nonce", type: "bytes32", internalType: "bytes32" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view"
    },
    // ── Events ───────────────────────────────────────────────────────────────
    {
        type: "event",
        name: "TokenQrypted",
        inputs: [
            { name: "token",  type: "address", indexed: true  },
            { name: "amount", type: "uint256", indexed: false },
            { name: "qToken", type: "address", indexed: true  }
        ]
    },
    {
        type: "event",
        name: "TokenUnqrypted",
        inputs: [
            { name: "token",  type: "address", indexed: true  },
            { name: "amount", type: "uint256", indexed: false }
        ]
    },
    {
        type: "event",
        name: "TransferUnveiled",
        inputs: [
            { name: "token",  type: "address", indexed: true  },
            { name: "to",     type: "address", indexed: true  },
            { name: "amount", type: "uint256", indexed: false }
        ]
    },
    {
        type: "event",
        name: "TransferVeiled",
        inputs: [
            { name: "veilHash", type: "bytes32", indexed: true }
        ]
    },
    {
        type: "event",
        name: "ChainRecharged",
        inputs: [
            { name: "newHead", type: "bytes32", indexed: false }
        ]
    },
    {
        type: "event",
        name: "QTokenCreated",
        inputs: [
            { name: "token",  type: "address", indexed: true },
            { name: "qToken", type: "address", indexed: true }
        ]
    },
    {
        type: "event",
        name: "EmergencyExit",
        inputs: [
            { name: "token",  type: "address", indexed: true  },
            { name: "amount", type: "uint256", indexed: false }
        ]
    },
    {
        type: "event",
        name: "AirBagsFunded",
        inputs: [
            { name: "token",  type: "address", indexed: true  },
            { name: "amount", type: "uint256", indexed: false }
        ]
    },
    {
        type: "event",
        name: "AirBagsReclaimed",
        inputs: [
            { name: "token",  type: "address", indexed: true  },
            { name: "amount", type: "uint256", indexed: false }
        ]
    },
    {
        type: "event",
        name: "AirVoucherRedeemed",
        inputs: [
            { name: "nonce",     type: "bytes32", indexed: true  },
            { name: "token",     type: "address", indexed: true  },
            { name: "amount",    type: "uint256", indexed: false },
            { name: "recipient", type: "address", indexed: true  }
        ]
    }
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// ERC-20 ABI (shared by V5 and V6)
// ─────────────────────────────────────────────────────────────────────────────

export const ERC20_ABI = [
    {
        type: "function",
        name: "name",
        inputs: [],
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "symbol",
        inputs: [],
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "decimals",
        inputs: [],
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "allowance",
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" }
        ],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view"
    },
    {
        type: "function",
        name: "approve",
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" }
        ],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable"
    }
] as const;
