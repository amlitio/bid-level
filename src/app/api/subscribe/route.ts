import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// ─── POST /api/subscribe ───────────────────────────────────────────────────────
// Clients created inside the handler so env vars are available at runtime,
// not during Next.js's static-analysis build phase.
export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM     = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  const REPLY_TO = 'hello@bidlevel.xyz';

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = (body.email ?? '').toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required.' }, { status: 400 });
  }

  // ── insert into Supabase ──────────────────────────────────────────────────
  const { error: dbErr } = await supabase.from('waitlist').insert({
    email,
    full_name:      (body.full_name      ?? '').trim() || null,
    company:        (body.company        ?? '').trim() || null,
    role:           (body.role           ?? '').trim() || null,
    project_volume: (body.project_volume ?? '').trim() || null,
    source:         'landing_page',
  });

  if (dbErr) {
    // unique constraint → already subscribed
    if (dbErr.code === '23505') {
      return NextResponse.json(
        { error: "You're already on the list! Check your inbox." },
        { status: 409 },
      );
    }
    console.error('[subscribe] db insert error:', dbErr);
    return NextResponse.json(
      { error: 'Could not join waitlist. Please try again.' },
      { status: 500 },
    );
  }

  // ── send welcome email (fire-and-forget) ──────────────────────────────────
  resend.emails.send({
    from:     FROM,
    to:       email,
    replyTo:  REPLY_TO,
    subject:  "You're on the Bid Level early access list",
    html:     welcomeEmail({ name: body.full_name }),
  }).catch(err => console.error('[subscribe] welcome email failed:', err));

  return NextResponse.json({ ok: true });
}

// ─── email templates ──────────────────────────────────────────────────────────
function welcomeEmail({ name }: { name?: string }) {
  const greeting = name ? `Hi ${name.split(' ')[0]},` : 'Hi there,';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0B0E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px;">

  <!-- logo -->
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:36px;">
    <div style="width:30px;height:30px;background:#FF6B35;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#0A0B0E;font-weight:900;font-size:15px;line-height:1;">B</span>
    </div>
    <span style="color:#E8EAED;font-size:15px;font-weight:700;letter-spacing:0.04em;">BID<span style="color:#FF6B35;">LEVEL</span></span>
  </div>

  <h1 style="color:#E8EAED;font-size:28px;font-weight:700;margin:0 0 14px;line-height:1.15;">
    You're on the list. 🎉
  </h1>

  <p style="color:#8B92A0;font-size:15px;line-height:1.65;margin:0 0 28px;">
    ${greeting} Thanks for joining the Bid Level early access waitlist.
    We're inviting the <strong style="color:#E8EAED;">first 50 estimators</strong> into the beta — you're in that group.
  </p>

  <!-- what it does -->
  <div style="background:#13161B;border:1px solid #2A2F38;border-radius:10px;padding:24px 28px;margin-bottom:28px;">
    <p style="color:#5A6170;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 14px;">What Bid Level does</p>
    <p style="color:#E8EAED;font-size:14px;line-height:1.65;margin:0 0 16px;">
      Drop a BIM/IFC file. Get a complete <strong>CSI MasterFormat takeoff in 60 seconds</strong>.
      Click any line item — the exact elements it counted light up in 3D.
      Compare revisions and catch architect changes before they erode your margin.
    </p>
    <p style="color:#8B92A0;font-size:13px;margin:0;">No Revit. No Navisworks. No install. Pure browser.</p>
  </div>

  <!-- CTA -->
  <a href="https://bidlevel.xyz/#demo"
     style="display:inline-block;background:#FF6B35;color:#0A0B0E;text-decoration:none;padding:13px 26px;border-radius:6px;font-weight:700;font-size:14px;margin-bottom:32px;">
    Try the interactive demo →
  </a>

  <!-- what's next -->
  <div style="border-top:1px solid #2A2F38;padding-top:24px;margin-bottom:32px;">
    <p style="color:#5A6170;font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;margin:0 0 12px;">What happens next</p>
    <ul style="color:#8B92A0;font-size:13px;line-height:1.9;margin:0;padding-left:18px;">
      <li>We'll reach out within 24 hours with your personal beta invite</li>
      <li>First 50 signups lock in Solo at <strong style="color:#E8EAED;">$199 lifetime</strong> (normally $79/month)</li>
      <li>We'll walk through your first real IFC file with you</li>
    </ul>
  </div>

  <p style="color:#3A414C;font-size:11px;line-height:1.7;margin:0;">
    © 2026 Bid Level ·
    <a href="https://bidlevel.xyz" style="color:#3A414C;">bidlevel.xyz</a><br>
    You received this because you joined our waitlist.
  </p>
</div>
</body>
</html>`;
}
