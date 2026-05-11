# Dropbox App Setup — Won Vision Pipeline

Follow these steps once to register the Dropbox app and obtain a refresh token for the AI pipeline.

## Steps

1. Open https://www.dropbox.com/developers/apps

2. Click **Create app**
   - API: **Scoped access**
   - Access type: **Full Dropbox** (Won Vision uses a dedicated team account)
   - Name: **Won Vision Pipeline**

3. On the app's **Settings** tab:
   - Go to the **Permissions** tab and enable:
     - `files.content.write`
     - `files.content.read`
     - `files.metadata.read`
     - `files.metadata.write`
   - Click **Submit**. Then return to **Settings**.

4. Note **App key** and **App secret** — add these to Vercel env as:
   - `DROPBOX_APP_KEY`
   - `DROPBOX_APP_SECRET`

5. Add `DROPBOX_APP_KEY` and `DROPBOX_APP_SECRET` to your local `.env.local`, then run:
   ```bash
   npm run dropbox:bootstrap
   ```
   The script opens an auth URL in the console. Open it in a browser, sign in to the **Won Vision Dropbox account**, click **Allow**, copy the auth code, and paste it back into the terminal.

6. Copy the printed `DROPBOX_REFRESH_TOKEN` value into Vercel env (Production + Preview + Development) as `DROPBOX_REFRESH_TOKEN`.

7. Also add `DROPBOX_REFRESH_TOKEN` to `.env.local`, then confirm everything works:
   ```bash
   npm run dropbox:bootstrap -- --verify
   ```
   Expected output: `list_folder status: 200` followed by a JSON list of the Dropbox root. Exit code 0.

## Notes

- The app uses the **offline** (refresh-token) flow — the access token is refreshed automatically at runtime (4-hour TTL, cached in-process).
- All pipeline files land under `/Virtual Editing/` in the Won Vision Dropbox:
  - `00 INTAKE/` — original uploads
  - `01 AI PROCESSING/` — intermediate + attempt files
  - `02 EDITOR REVIEW/` — final variant pairs for human review
- The Dropbox app is scoped to this project only. Do not share credentials with other projects.
