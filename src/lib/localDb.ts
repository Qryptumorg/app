const DB_NAME = "qryptum-local";
const DB_VERSION = 1;
const STORE_CHAIN = "chain";
const STORE_VOUCHERS = "vouchers";
const STORE_CHECKPOINTS = "checkpoints";

let _db: IDBDatabase | null = null;
let _opening = false;
const _queue: Array<(db: IDBDatabase) => void> = [];

function openDb(): Promise<IDBDatabase> {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
        if (_opening) { _queue.push(resolve); return; }
        _opening = true;
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_CHAIN)) db.createObjectStore(STORE_CHAIN);
            if (!db.objectStoreNames.contains(STORE_VOUCHERS)) db.createObjectStore(STORE_VOUCHERS);
            if (!db.objectStoreNames.contains(STORE_CHECKPOINTS)) db.createObjectStore(STORE_CHECKPOINTS);
        };
        req.onsuccess = (e) => {
            _db = (e.target as IDBOpenDBRequest).result;
            _opening = false;
            _queue.forEach(fn => fn(_db!));
            _queue.length = 0;
            resolve(_db);
        };
        req.onerror = () => { _opening = false; reject(req.error); };
    });
}

async function idbGet<T>(store: string, key: string): Promise<T | undefined> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const req = db.transaction(store, "readonly").objectStore(store).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idbPut(store: string, key: string, value: unknown): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const req = db.transaction(store, "readwrite").objectStore(store).put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

async function idbDelete(store: string, key: string): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const req = db.transaction(store, "readwrite").objectStore(store).delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

async function idbGetAll<T>(store: string): Promise<T[]> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const req = db.transaction(store, "readonly").objectStore(store).getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
    });
}

// ── Chain position ────────────────────────────────────────────────────────────

export async function dbSetChainPos(key: string, pos: number): Promise<void> {
    try { await idbPut(STORE_CHAIN, key, pos); } catch { /* localStorage is the fallback */ }
}

export async function dbGetChainPos(key: string): Promise<number | null> {
    try {
        const val = await idbGet<number>(STORE_CHAIN, key);
        return val !== undefined ? val : null;
    } catch { return null; }
}

export async function dbDelChainPos(key: string): Promise<void> {
    try { await idbDelete(STORE_CHAIN, key); } catch {}
}

// ── Sync checkpoints ─────────────────────────────────────────────────────────

export async function dbGetCheckpoint(walletAddress: string, chainId: number): Promise<number | null> {
    try {
        const val = await idbGet<number>(STORE_CHECKPOINTS, `${walletAddress.toLowerCase()}:${chainId}`);
        return val !== undefined ? val : null;
    } catch { return null; }
}

export async function dbSetCheckpoint(walletAddress: string, chainId: number, blockNumber: number): Promise<void> {
    try { await idbPut(STORE_CHECKPOINTS, `${walletAddress.toLowerCase()}:${chainId}`, blockNumber); } catch {}
}

// ── Voucher records (QryptAir offToken history) ───────────────────────────────

export interface DbVoucherRecord {
    id: string;
    tokenSymbol: string;
    tokenAddress: string;
    amount: string;
    recipient: string;
    vaultAddress: string;
    deadline: number;
    chainId: number;
    createdAt: number;
    status: "pending" | "expired" | "claimed";
    qrData: string;
    signature: string;
    nonce?: string;
}

export async function dbGetAllVouchers(): Promise<DbVoucherRecord[]> {
    try {
        const all = await idbGetAll<DbVoucherRecord>(STORE_VOUCHERS);
        return all.sort((a, b) => b.createdAt - a.createdAt);
    } catch { return []; }
}

export async function dbPutAllVouchers(records: DbVoucherRecord[]): Promise<void> {
    try {
        const db = await openDb();
        const tx = db.transaction(STORE_VOUCHERS, "readwrite");
        const store = tx.objectStore(STORE_VOUCHERS);
        await new Promise<void>((res, rej) => {
            const req = store.clear();
            req.onsuccess = () => res();
            req.onerror = () => rej(req.error);
        });
        for (const r of records) store.put(r, r.id);
        await new Promise<void>((res, rej) => {
            tx.oncomplete = () => res();
            tx.onerror = () => rej(tx.error);
        });
    } catch {}
}
