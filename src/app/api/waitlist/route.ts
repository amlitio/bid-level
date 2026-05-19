import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.email || !body.email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const { error } = await supabase.from('waitlist').insert({
    email: body.email,
    full_name: body.full_name || null,
    company: body.company || null,
    role: body.role || null,
    project_volume: body.project_volume || null,
    source: req.headers.get('referer') || 'direct',
  });

  if (error && !error.message.includes('duplicate')) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const firstName = body.full_name ? body.full_name.split(' ')[0] : null;
  resend.emails.send({
    from: 'Bid Level <hello@bidlevel.app>',
    to: body.email,
    subject: "You're on the Bid Level waitlist",
    html: `
      <p>Hey${firstName ? ' ' + firstName : ''},</p>
      <p>Thanks for jumping on the Bid Level waitlist. We're opening up beta access in waves over the next two weeks — you'll get an invite within 24 hours.</p>
      <p>In the meantime, the interactive demo at <a href="https://bidlevel.app/#demo">bidlevel.app/#demo</a> uses the same parsing pipeline you'll get on your own files. Click any line item and watch it light up.</p>
      <p>Reply to this email if you've got a specific IFC file you want us to test against — we're looking for real-world stress tests.</p>
      <p>— G<br>Bid Level</p>
    `,
  }).catch(() => { /* fire-and-forget */ });

  return NextResponse.json({ ok: true });
}
