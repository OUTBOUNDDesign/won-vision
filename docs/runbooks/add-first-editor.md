# Add the first editor (Phase 2 setup)

After Phase 2 ships, before Phase 5 admin features, the first editor needs to be inserted manually because the dashboard refuses to authorize anyone who isn't already in the `editors` table.

1. Go to https://wonvision.com.au/admin/sign-up and create your Clerk account with the editor's email.
2. Sign in. The dashboard will say "Your account is signed in, but is not authorized as an editor."
3. Find your Clerk user ID:
   - Go to https://dashboard.clerk.com → select the `won-vision` application → Users → click your user → copy the **User ID** (starts with `user_`).
4. Run the seed script locally:
   ```bash
   cd ~/Code/won-media
   npm run seed:editor user_XXXXXXXXXXXXXX you@email.com admin
   ```
5. Refresh https://wonvision.com.au/admin — you should now see the placeholder dashboard.

To add another editor later: repeat steps 1-4 but use `editor` instead of `admin` for the role argument (or omit — defaults to admin).

## Idempotency

The script checks for an existing row by `clerk_user_id` before inserting. Running it twice with the same Clerk user ID is a no-op; it'll print "Editor already exists" and exit 0.

## Troubleshooting

- **Script errors with "DATABASE_URL is not set":** make sure `.env.local` exists at the repo root with `DATABASE_URL` (run `vercel env pull .env.local` to repopulate).
- **Insert fails with email unique constraint:** an editor with that email already exists under a different Clerk user ID. Either reuse the existing Clerk account or delete the orphan row in Neon: `DELETE FROM editors WHERE email = 'you@email.com';`
