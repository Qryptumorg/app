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

const jwt = process.env.PINATA_JWT;
const sha = (process.env.COMMIT_SHA || 'unknown').slice(0, 7);
const folder = 'qryptum-hub-' + sha;
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
console.log('');
console.log('Routes after ENS update:');
console.log('  /          -> qryptum.eth.limo (Landing)');
console.log('  /app       -> qryptum.eth.limo/app (ShieldTransfer)');
console.log('  /qryptair  -> qryptum.eth.limo/qryptair (QryptAir)');
console.log('');
console.log('Set ENS contenthash on qryptum.eth: ipfs://' + cid);
console.log('===============================');

const summary = [
  '## IPFS Deploy - Qryptum Hub',
  '',
  '| | |',
  '|---|---|',
  '| **CID** | ' + cid + ' |',
  '| **Commit** | ' + sha + ' |',
  '| **eth.limo** | https://qryptum.eth.limo |',
  '',
  '### Sub-paths',
  '| Path | App |',
  '|---|---|',
  '| / | Landing Hub |',
  '| /app | ShieldTransfer dApp |',
  '| /qryptair | QryptAir PWA |',
  '',
  '### Next step: Update qryptum.eth contenthash',
  '1. Go to https://app.ens.domains/qryptum.eth',
  '2. Edit Records -> Content Hash',
  '3. Enter: ipfs://' + cid,
  '4. Save (gas required)',
].join('\n');

fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
