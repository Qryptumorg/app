import {
  startRailgunEngine, loadProvider, createRailgunWallet, getRailgunAddress,
  ArtifactStore, refreshBalances, awaitWalletScan,
  fullWalletForID, balanceForERC20Token,
} from "@railgun-community/wallet";
import { NetworkName, TXIDVersion, ChainType } from "@railgun-community/shared-models";
import { ethers } from "ethers";
import { MemoryLevelDOWN } from "./src/lib/level-memory";
import { formatUnits } from "viem";

const NEW_PK       = "0x27b93fe3864bac87cc3328d90343f610db18a29d43e5394393fda6375b396f2c";
const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
const NETWORK      = NetworkName.EthereumSepolia;
const CHAIN_ID     = 11155111;
const PUBLIC_RPC   = "https://ethereum-sepolia-rpc.publicnode.com";

const ethWallet = new ethers.Wallet(NEW_PK);

function log(msg: string) { console.log(`[${new Date().toISOString().slice(11,23)}] ${msg}`); }

const artifactMem = new Map<string, string | Uint8Array>();
const artifactStore = new ArtifactStore(
  async (p) => artifactMem.get(p) ?? null,
  async (_d, p, item) => { artifactMem.set(p, item); },
  async (p) => artifactMem.has(p),
);

const db = new MemoryLevelDOWN() as unknown as import("abstract-leveldown").AbstractLevelDOWN;
await startRailgunEngine("qryptumtest", db, false, artifactStore, false, false, []);

await loadProvider({
  chainId: CHAIN_ID,
  providers: [{ provider: PUBLIC_RPC, priority: 1, weight: 2, stallTimeout: 5000 }],
} as Parameters<typeof loadProvider>[0], NETWORK, 30000);
log("Engine + provider ready");

const encKeySig = await ethWallet.signMessage("Qryptum: authorize privacy wallet");
const encKeyHex = encKeySig.startsWith("0x") ? encKeySig.slice(2) : encKeySig;
const encryptionKey = `0x${encKeyHex.slice(0, 64).padEnd(64, "0")}`;
const rawKey = encryptionKey.slice(2);
const entropy  = ethers.keccak256(ethers.solidityPacked(["address","bytes32"],["0x60ebF88696FF68CdF2FbaD7a98519710b8C9A721", encryptionKey]));
const mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.getBytes(entropy));
const rgInfo   = await createRailgunWallet(rawKey, mnemonic, null);
const walletID = rgInfo.id;
log(`Railgun wallet: ${getRailgunAddress(walletID)}`);

const chain = { type: ChainType.EVM, id: CHAIN_ID };

log("Calling refreshBalances() to trigger scan...");
await refreshBalances(chain, [walletID]);
log("refreshBalances() called. Waiting for scan event...");

await Promise.race([
  awaitWalletScan(walletID, chain),
  new Promise<void>(r => setTimeout(r, 120_000)),
]);
log("Scan event fired or timeout.");

const w = fullWalletForID(walletID);
const bal = await balanceForERC20Token(TXIDVersion.V2_PoseidonMerkle, w, NETWORK, USDC_SEPOLIA, false);
log(`USDC balance in Railgun wallet: ${formatUnits(bal, 6)}`);
log(bal > 0n ? "SUCCESS: Balance found!" : "FAIL: Balance still 0 after refreshBalances");
