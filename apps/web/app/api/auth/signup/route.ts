/**
 * Creates a console account.
 *
 * Email confirmation is on for this Supabase project, so a plain client-side sign-up would leave
 * the user waiting for a mail that nobody sends. The admin API creates the user already confirmed
 * instead, and the browser signs in with the password straight afterwards.
 */
import { NextResponse } from "next/server";
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { email?: unknown; password?: unknown; company?: unknown };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as Body;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Use a password of at least 8 characters." }, { status: 400 });
  }
  if (company.length < 2) {
    return NextResponse.json({ error: "Enter your company name." }, { status: 400 });
  }

  const response = await fetch(`${supabaseUrl()}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: supabaseServiceRoleKey(),
      authorization: `Bearer ${supabaseServiceRoleKey()}`,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { company },
    }),
  });

  if (!response.ok) {
    const detail = (await response.json().catch(() => ({}))) as { msg?: string; message?: string };
    const message = detail.msg ?? detail.message ?? "The account could not be created.";
    // 422 is what Supabase answers for an address that already has an account.
    return NextResponse.json({ error: message }, { status: response.status === 422 ? 409 : 502 });
  }

  return NextResponse.json({ ok: true });
}
