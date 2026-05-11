// scripts/dropbox-bootstrap.ts
// Exchanges a Dropbox auth code for an offline refresh token (default mode).
// Use --verify to confirm an existing DROPBOX_REFRESH_TOKEN is valid.
import 'dotenv/config';
import readline from 'node:readline/promises';

const KEY = process.env.DROPBOX_APP_KEY!;
const SECRET = process.env.DROPBOX_APP_SECRET!;
if (!KEY || !SECRET) throw new Error('Set DROPBOX_APP_KEY + DROPBOX_APP_SECRET in .env.local first.');

const VERIFY = process.argv.includes('--verify');

async function exchangeAuthCode(code: string) {
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: KEY,
    client_secret: SECRET,
  });
  const res = await fetch('https://api.dropbox.com/oauth2/token', { method: 'POST', body });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<{ access_token: string; refresh_token: string }>;
}

async function refreshAccessToken(refresh: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: KEY,
    client_secret: SECRET,
  });
  const res = await fetch('https://api.dropbox.com/oauth2/token', { method: 'POST', body });
  if (!res.ok) throw new Error(`Refresh failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<{ access_token: string }>;
}

async function main() {
  if (VERIFY) {
    const refresh = process.env.DROPBOX_REFRESH_TOKEN;
    if (!refresh) throw new Error('Set DROPBOX_REFRESH_TOKEN to verify.');
    const { access_token } = await refreshAccessToken(refresh);
    const list = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '' }),
    });
    console.log('list_folder status:', list.status);
    console.log(await list.text());
    process.exit(list.ok ? 0 : 1);
  }

  const authUrl =
    `https://www.dropbox.com/oauth2/authorize?client_id=${KEY}` +
    `&token_access_type=offline&response_type=code`;
  console.log('Open this URL, sign in to the Won Vision Dropbox, click Allow, then paste the code shown:\n', authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = (await rl.question('Auth code: ')).trim();
  rl.close();

  const tok = await exchangeAuthCode(code);
  console.log('\nSave these to Vercel env (all three environments):');
  console.log('DROPBOX_REFRESH_TOKEN =', tok.refresh_token);
}

main().catch((err) => { console.error(err); process.exit(1); });
