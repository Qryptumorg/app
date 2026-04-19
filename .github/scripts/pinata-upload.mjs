import fs from 'fs';
import path from 'path';

function getFiles(dir, base) {
  if (!base) base = dir;
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...getFiles(full, base));
    else {
      const rel = path.relative(base, full);
      if (!rel.endsWith('.map')) out.push({ full, rel });
    }
  }
  return out;
}

// Encode IPFS CIDv1 (bafy...) to ENS contenthash hex - no external deps needed
function ipfsCidToContenthash(cid) {
  if (cid.startsWith('Qm')) {
    // CIDv0: base58 -> multihash bytes, prepend 0xe3 0x01 0x00 0x...
    const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let n = 0n;
    for (const c of cid) n = n * 58n + BigInt(B58.indexOf(c));
    const hex = n.toString(16).padStart(68, '0');
    return '0xe30100' + hex;
  }
  // CIDv1 base32 (starts with 'b')
  const alpha = 'abcdefghijklmnopqrstuvwxyz234567';
  const str = cid.toLowerCase().slice(1);
  let bits = 0, val = 0;
  const bytes = [];
  for (const c of str) {
    const idx = alpha.indexOf(c);
    if (idx < 0) throw new Error('Bad base32 char: ' + c);
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) { bytes.push((val >> (bits - 8)) & 0xff); bits -= 8; }
  }
  const prefix = Buffer.from([0xe3, 0x01]);
  return '0x' + Buffer.concat([prefix, Buffer.from(bytes)]).toString('hex');
}

const jwt = process.env.PINATA_JWT;
const sha = (process.env.COMMIT_SHA || 'unknown').slice(0, 7);
const folder = 'qryptum-hub-' + sha;

// --- 1. Delete ALL old pins to stay under account limit ---
console.log('Fetching all existing pins to clean up...');
let offset = 0;
let allPins = [];
while (true) {
  const listRes = await fetch('https://api.pinata.cloud/pinning/pinList?status=pinned&pageLimit=1000&pageOffset=' + offset, {
    headers: { Authorization: 'Bearer ' + jwt },
  });
  const listData = await listRes.json();
  const rows = listData.rows || [];
  allPins = allPins.concat(rows);
  if (rows.length < 1000) break;
  offset += 1000;
}
console.log('Total pins to delete:', allPins.length);
for (const pin of allPins) {
  const delRes = await fetch('https://api.pinata.cloud/pinning/unpin/' + pin.ipfs_pin_hash, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + jwt },
  });
  console.log('Deleted', pin.ipfs_pin_hash, pin.metadata?.name || '', '->', delRes.status);
}

// --- 2. Upload ---
const entries = getFiles('./dist');
let totalBytes = 0;
const data = new FormData();
for (const { full, rel } of entries) {
  const bytes = fs.readFileSync(full);
  totalBytes += bytes.length;
  const filePath = folder + '/' + rel;
  data.append('file', new File([bytes], filePath), filePath);
}
data.append('pinataMetadata', JSON.stringify({ name: folder }));
data.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

console.log('Files  :', entries.length, '(source maps excluded)');
console.log('Size   :', (totalBytes / 1024 / 1024).toFixed(2), 'MB');
console.log('Uploading to Pinata...');

const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
  method: 'POST',
  headers: { Authorization: 'Bearer ' + jwt, Source: 'sdk/fileArray' },
  body: data,
});
const text = await res.text();
console.log('HTTP   :', res.status);

let result;
try { result = JSON.parse(text); }
catch { console.error('Bad response:', text.slice(0, 500)); process.exit(1); }

if (!result.IpfsHash) {
  console.error('Pinata error:', JSON.stringify(result));
  process.exit(1);
}

const cid = result.IpfsHash;
console.log('');
console.log('===== IPFS Upload Success =====');
console.log('CID    :', cid);
console.log('ipfs://' + cid);
console.log('===============================');

// --- 3. Update ENS contenthash on-chain ---
if (process.env.ENS_PRIVATE_KEY && process.env.MAINNET_RPC_URL) {
  console.log('\nUpdating ENS contenthash for qryptum.eth...');
  try {
    const { ethers } = await import('ethers');

    const privateKey = process.env.ENS_PRIVATE_KEY.startsWith('0x')
      ? process.env.ENS_PRIVATE_KEY
      : '0x' + process.env.ENS_PRIVATE_KEY;

    const provider = new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('Operator:', wallet.address);

    const registry = new ethers.Contract(
      '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
      ['function resolver(bytes32 node) view returns (address)'],
      provider
    );
    const node = ethers.namehash('qryptum.eth');
    const resolverAddr = await registry.resolver(node);
    console.log('Resolver:', resolverAddr);

    const resolver = new ethers.Contract(
      resolverAddr,
      ['function setContenthash(bytes32 node, bytes calldata hash) external'],
      wallet
    );

    const encoded = ipfsCidToContenthash(cid);
    console.log('Contenthash:', encoded.slice(0, 20) + '...');

    const tx = await resolver.setContenthash(node, encoded);
    console.log('TX:', tx.hash);
    const receipt = await tx.wait();
    console.log('ENS updated! Block:', receipt.blockNumber);
    console.log('qryptum.eth -> ipfs://' + cid);
  } catch (err) {
    console.error('ENS update failed (non-fatal):', err.message);
  }
} else {
  console.log('Skipping ENS update - ENS_PRIVATE_KEY or MAINNET_RPC_URL not set');
}

const summary = [
  '## IPFS Deploy - Qryptum Hub',
  '| | |',
  '|---|---|',
  '| **CID** | `' + cid + '` |',
  '| **Commit** | `' + sha + '` |',
  '| **IPFS** | `ipfs://' + cid + '` |',
  '| **eth.limo** | https://qryptum.eth.limo |',
  '',
  '| Path | App |',
  '|---|---|',
  '| `/` | Landing |',
  '| `/app` | ShieldTransfer |',
  '| `/qryptair` | QryptAir |',
  '| `/docs` | Docs |',
  '| `/site` | Site |',
].join('\n');

fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
