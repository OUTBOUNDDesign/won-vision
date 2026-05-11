// lib/dropbox/client.ts
// Minimal HTTP client around Dropbox API v2. Refresh-token flow.
// Access tokens are cached in-process for their TTL (default 4h).

let cached: { access: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.access;

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: process.env.DROPBOX_REFRESH_TOKEN!,
    client_id: process.env.DROPBOX_APP_KEY!,
    client_secret: process.env.DROPBOX_APP_SECRET!,
  });
  const res = await fetch('https://api.dropbox.com/oauth2/token', { method: 'POST', body });
  if (!res.ok) throw new Error(`Dropbox refresh failed: ${res.status} ${await res.text()}`);
  const json = await res.json() as { access_token: string; expires_in: number };

  cached = { access: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cached.access;
}

async function rpc<T>(endpoint: string, body: unknown): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`https://api.dropboxapi.com/2/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Dropbox ${endpoint} failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function ensureFolder(path: string): Promise<void> {
  try {
    await rpc('files/create_folder_v2', { path, autorename: false });
  } catch (err) {
    // 409 = already exists, which is fine
    if (err instanceof Error && /path.*conflict/i.test(err.message)) return;
    throw err;
  }
}

export async function uploadFromUrl(url: string, dropboxPath: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Source fetch failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const token = await getAccessToken();
  const upload = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: dropboxPath, mode: 'overwrite', autorename: false, mute: true,
      }),
    },
    body: new Uint8Array(buf),
  });
  if (!upload.ok) throw new Error(`Dropbox upload failed: ${upload.status} ${await upload.text()}`);
  const meta = await upload.json() as { path_display: string };
  return meta.path_display;
}

export async function move(fromPath: string, toPath: string): Promise<void> {
  await rpc('files/move_v2', { from_path: fromPath, to_path: toPath, autorename: false });
}

export async function getTemporaryLink(path: string): Promise<string> {
  const json = await rpc<{ link: string }>('files/get_temporary_link', { path });
  return json.link;
}
