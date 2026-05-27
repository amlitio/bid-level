import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// ─── Vercel Cron: runs daily at 09:00 UTC ─────────────────────────────────────
// Vercel automatically sets Authorization: Bearer <CRON_SECRET> on cron calls.
// The same secret must be set in your Vercel project env vars.

const FROM     = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const REPLY_TO = 'hello@bidlevel.xyz';

export async function GET(req: NextRequest) {
  // ── auth ────────────────────────────────────────────────────────────────────
  const auth = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  const now   = new Date();
  const stats = { day3: 0, day7: 0, errors: 0 };

  // ── helper: date window for N days ago ────────────────────────────────────
  const window = (daysAgo: number) => {
    const start = new Date(now);
    start.setDate(start.getDate() - daysAgo);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  };

  // ── Day 3 email ────────────────────────────────────────────────────────────
  const w3 = window(3);
  const { data: list3 } = await supabase
    .from('waitlist')
    .select('id, email, full_name')
    .gte('created_at', w3.start)
    .lte('created_at', w3.end)
    .eq('drip_3_sent', false);

  for (const c of list3 ?? []) {
    try {
      await resend.emails.send({
        from:    FROM,
        to:      c.email,
        replyTo: REPLY_TO,
        subject: 'How estimators cut takeoff time by 80% (real numbers)',
        html:    day3Email({ name: c.full_name }),
      });
      await supabase.from('waitlist').update({ drip_3_sent: true }).eq('id', c.id);
      stats.day3++;
    } catch (err) {
      console.error('[drip] day3 failed for', c.email, err);
      stats.errors++;
    }
  }

  // ── Day 7 email ────────────────────────────────────────────────────────────
  const w7 = window(7);
  const { data: list7 } = await supabase
    .from('waitlist')
    .select('id, email, full_name')
    .gte('created_at', w7.start)
    .lte('created_at', w7.end)
    .eq('drip_7_sent', false);

  for (const c of list7 ?? []) {
    try {
      await resend.emails.send({
        from:    FROM,
        to:      c.email,
        replyTo: REPLY_TO,
        subject: 'Your Bid Level beta invite — 50 spots, almost gone',
        html:    day7Email({ name: c.full_name }),
      });
      await supabase.from('waitlist').update({ drip_7_sent: true }).eq('id', c.id);
      stats.day7++;
    } catch (err) {
      console.error('[drip] day7 failed for', c.email, err);
      stats.errors++;
    }
  }

  console.log('[drip] cron complete', stats);
  return NextResponse.json({ ok: true, ...stats });
}

// ─── Email templates ──────────────────────────────────────────────────────────

function day3Email({ name }: { name?: string }) {
  const greeting = name ? `Hi ${name.split(' ')[0]},` : 'Hi there,';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0B0E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px;">

  <div style="display:flex;align-items:center;gap:10px;margin-bottom:36px;">
    <div style="width:30px;height:30px;background:#FF6B35;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#0A0B0E;font-weight:900;font-size:15px;line-height:1;">B</span>
    </div>
    <span style="color:#E8EAED;font-size:15px;font-weight:700;letter-spacing:0.04em;">BID<span style="color:#FF6B35;">LEVEL</span></span>
  </div>

  <h1 style="color:#E8EAED;font-size:26px;font-weight:700;margin:0 0 16px;line-height:1.2;">
    The average estimator spends 14 hours on a single takeoff.
  </h1>

  <p style="color:#8B92A0;font-size:15px;line-height:1.65;margin:0 0 24px;">
    ${greeting} We surveyed 40 SMB GCs and subcontractors. Here's what we found:
  </p>

  <!-- stats -->
  <div style="background:#13161B;border:1px solid #2A2F38;border-radius:10px;padding:24px 28px;margin-bottom:24px;">
    <div style="border-bottom:1px solid #2A2F38;padding-bottom:18px;margin-bottom:18px;">
      <span style="color:#FF6B35;font-size:32px;font-weight:700;font-family:ui-monospace,monospace;">14 hrs</span>
      <p style="color:#8B92A0;font-size:13px;margin:6px 0 0;">average per takeoff on a mid-size commercial project</p>
    </div>
    <div style="border-bottom:1px solid #2A2F38;padding-bottom:18px;margin-bottom:18px;">
      <span style="color:#FF6B35;font-size:32px;font-weight:700;font-family:ui-monospace,monospace;">1 in 3</span>
      <p style="color:#8B92A0;font-size:13px;margin:6px 0 0;">bids contain quantity errors that erode margin after award</p>
    </div>
    <div>
      <span style="color:#FF6B35;font-size:32px;font-weight:700;font-family:ui-monospace,monospace;">$180/hr</span>
      <p style="color:#8B92A0;font-size:13px;margin:6px 0 0;">fully-loaded cost of estimator time in most US markets</p>
    </div>
  </div>

  <p style="color:#8B92A0;font-size:15px;line-height:1.65;margin:0 0 24px;">
    Bid Level cuts that 14 hours to under 2. Drop an IFC file, get a complete CSI MasterFormat
    takeoff with every quantity linked back to exact 3D geometry. Click any row — the elements
    it counted light up in the model.
  </p>

  <a href="https://bidlevel.xyz/#demo"
     style="display:inline-block;background:#FF6B35;color:#0A0B0E;text-decoration:none;padding:13px 26px;border-radius:6px;font-weight:700;font-size:14px;margin-bottom:32px;">
    Watch the 2-minute demo →
  </a>

  <!-- feature list -->
  <div style="background:#0D1A24;border:1px solid #1E3A52;border-radius:10px;padding:24px 28px;margin-bottom:32px;">
    <p style="color:#5A6170;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 14px;">What you get</p>
    <ul style="color:#E8EAED;font-size:13px;line-height:2;margin:0;padding-left:18px;">
      <li>Full quantity schedule grouped by CSI MasterFormat 2018</li>
      <li>Click-to-verify: every line item linked to 3D geometry</li>
      <li>Revision diff — see exactly what the architect changed</li>
      <li>Export to CSV/Excel, formatted for your existing templates</li>
      <li>No install, no license, pure browser</li>
    </ul>
  </div>

  <p style="color:#3A414C;font-size:11px;line-height:1.7;margin:0;">
    © 2026 Bid Level ·
    <a href="https://bidlevel.xyz" style="color:#3A414C;">bidlevel.xyz</a><br>
    You received this as part of our early access sequence.
  </p>
</div>
</body>
</html>`;
}

function day7Email({ name }: { name?: string }) {
  const greeting = name ? `Hi ${name.split(' ')[0]},` : 'Hi there,';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0B0E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px;">

  <div style="display:flex;align-items:center;gap:10px;margin-bottom:36px;">
    <div style="width:30px;height:30px;background:#FF6B35;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;">
      <span style="color:#0A0B0E;font-weight:900;font-size:15px;line-height:1;">B</span>
    </div>
    <span style="color:#E8EAED;font-size:15px;font-weight:700;letter-spacing:0.04em;">BID<span style="color:#FF6B35;">LEVEL</span></span>
  </div>

  <!-- urgency banner -->
  <div style="background:#1A0E00;border:1px solid #FF6B35;border-radius:8px;padding:14px 20px;margin-bottom:28px;">
    <p style="color:#FF6B35;font-size:13px;font-weight:600;margin:0;">
      ⚡ Beta spots filling fast — 38 of 50 claimed
    </p>
  </div>

  <h1 style="color:#E8EAED;font-size:26px;font-weight:700;margin:0 0 16px;line-height:1.2;">
    Your Bid Level beta invite is ready.
  </h1>

  <p style="color:#8B92A0;font-size:15px;line-height:1.65;margin:0 0 24px;">
    ${greeting} You signed up a week ago and your spot is still held.
    Here's what the first-50 beta includes:
  </p>

  <!-- benefits -->
  <div style="background:#13161B;border:1px solid #2A2F38;border-radius:10px;padding:24px 28px;margin-bottom:28px;">
    <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px;">
      <span style="color:#4ADE80;font-size:18px;flex-shrink:0;margin-top:1px;">✓</span>
      <div>
        <p style="color:#E8EAED;font-size:14px;font-weight:600;margin:0 0 3px;">Solo plan at $199 lifetime</p>
        <p style="color:#8B92A0;font-size:12px;margin:0;">Normally $79/month — locked in forever, no subscription</p>
      </div>
    </div>
    <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px;">
      <span style="color:#4ADE80;font-size:18px;flex-shrink:0;margin-top:1px;">✓</span>
      <div>
        <p style="color:#E8EAED;font-size:14px;font-weight:600;margin:0 0 3px;">Personal onboarding session</p>
        <p style="color:#8B92A0;font-size:12px;margin:0;">We'll walk through your first real IFC file with you, live</p>
      </div>
    </div>
    <div style="display:flex;align-items:flex-start;gap:14px;">
      <span style="color:#4ADE80;font-size:18px;flex-shrink:0;margin-top:1px;">✓</span>
      <div>
        <p style="color:#E8EAED;font-size:14px;font-weight:600;margin:0 0 3px;">Direct line to the founders</p>
        <p style="color:#8B92A0;font-size:12px;margin:0;">Your feedback shapes the roadmap — we mean it</p>
      </div>
    </div>
  </div>

  <p style="color:#8B92A0;font-size:15px;line-height:1.65;margin:0 0 28px;">
    Just reply to this email and we'll send your access link same day.
    Or try the live demo first — it runs a full real project in your browser right now.
  </p>

  <!-- CTAs -->
  <a href="mailto:hello@bidlevel.xyz?subject=I'm in — Bid Level beta"
     style="display:block;background:#FF6B35;color:#0A0B0E;text-decoration:none;padding:14px 26px;border-radius:6px;font-weight:700;font-size:14px;text-align:center;margin-bottom:12px;">
    Claim my beta spot →
  </a>
  <a href="https://bidlevel.xyz/#demo"
     style="display:block;background:transparent;color:#E8EAED;text-decoration:none;padding:12px 26px;border-radius:6px;font-weight:500;font-size:14px;text-align:center;border:1px solid #2A2F38;">
    Try the interactive demo first
  </a>

  <p style="color:#3A414C;font-size:11px;line-height:1.7;margin:32px 0 0;">
    © 2026 Bid Level ·
    <a href="https://bidlevel.xyz" style="color:#3A414C;">bidlevel.xyz</a><br>
    You received this as part of our early access sequence.
  </p>
</div>
</body>
</html>`;
}
