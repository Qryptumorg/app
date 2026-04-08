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
            { name: "password", type: "string", internalType: "string" }
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
            { name: "password", type: "string", internalType: "string" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
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
            { name: "password", type: "string", internalType: "string" },
            { name: "nonce", type: "uint256", internalType: "uint256" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    },
    {
        type: "function",
        name: "changeVaultProof",
        inputs: [
            { name: "oldPassword", type: "string", internalType: "string" },
            { name: "newPassword", type: "string", internalType: "string" }
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
    }
] as const;

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
