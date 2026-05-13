import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, shoots } from '@/lib/db';
import { verify } from '@/lib/crypto/hmac';

export const runtime = 'nodejs';

type Body = {
  ops_job_id: string;
  ops_job_ref: string;
  ops_tenant_slug?: string;
  address: { formatted: string };
  agent: { email: string };
};

function bad(status: number, reason: string) {
  return NextResponse.json({ error: reason }, { status });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const auth = verify(req.headers, raw);
  if (!auth.ok) return bad(auth.status, auth.reason);

  let body: Body;
  try {
    body = JSON.parse(raw);
  } catch {
    return bad(400, 'invalid-json');
  }

  const opsJobId = body.ops_job_id?.trim();
  const opsJobRef = body.ops_job_ref?.trim();
  const address = body.address?.formatted?.trim();
  const contactEmail = body.agent?.email?.trim().toLowerCase();
  const tenantSlug = body.ops_tenant_slug?.trim() ?? null;

  if (!opsJobId || !opsJobRef || !address || !contactEmail) {
    return bad(400, 'missing-required-fields');
  }

  const existing = await db
    .select({ id: shoots.id })
    .from(shoots)
    .where(eq(shoots.opsJobId, opsJobId))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ vision_property_id: existing[0].id }, { status: 200 });
  }

  const [created] = await db
    .insert(shoots)
    .values({
      address,
      contactEmail,
      opsJobId,
      opsJobRef,
      opsTenantSlug: tenantSlug,
    })
    .returning({ id: shoots.id });

  return NextResponse.json({ vision_property_id: created.id }, { status: 201 });
}
