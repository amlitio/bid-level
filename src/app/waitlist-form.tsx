'use client';
import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WaitlistForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setErrorMsg('');

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form);

    try {
      const res = await fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-start gap-4 p-6 bg-[#0D2B0D] border border-[#4ADE80] rounded-lg">
        <CheckCircle2 size={22} className="text-[#4ADE80] mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold text-[#4ADE80] mb-1">You&apos;re on the list.</div>
          <div className="text-sm text-[#8B92A0] leading-relaxed">
            Welcome email heading to your inbox now. We&apos;ll send your beta invite within 24 hours — check spam if you don&apos;t see it.
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        name="email"
        type="email"
        required
        placeholder="work email"
        className="w-full bg-[#13161B] border border-[#2A2F38] rounded px-4 py-3 text-[#E8EAED] placeholder-[#5A6170] focus:border-[#FF6B35] focus:outline-none transition"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="full_name"
          placeholder="name"
          className="bg-[#13161B] border border-[#2A2F38] rounded px-4 py-3 text-[#E8EAED] placeholder-[#5A6170] focus:border-[#FF6B35] focus:outline-none transition"
        />
        <input
          name="company"
          placeholder="company"
          className="bg-[#13161B] border border-[#2A2F38] rounded px-4 py-3 text-[#E8EAED] placeholder-[#5A6170] focus:border-[#FF6B35] focus:outline-none transition"
        />
      </div>
      <select
        name="role"
        className="w-full bg-[#13161B] border border-[#2A2F38] rounded px-4 py-3 text-[#8B92A0] focus:border-[#FF6B35] focus:outline-none transition"
      >
        <option value="">your role</option>
        <option>Owner / Founder</option>
        <option>Chief Estimator</option>
        <option>Estimator</option>
        <option>Project Manager</option>
        <option>Preconstruction</option>
        <option>Other</option>
      </select>
      <select
        name="project_volume"
        className="w-full bg-[#13161B] border border-[#2A2F38] rounded px-4 py-3 text-[#8B92A0] focus:border-[#FF6B35] focus:outline-none transition"
      >
        <option value="">annual project volume</option>
        <option>Under $5M</option>
        <option>$5M – $25M</option>
        <option>$25M – $100M</option>
        <option>Over $100M</option>
      </select>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-[#FF6B35] text-[#0A0B0E] font-semibold py-3 rounded hover:bg-[#FF7E4D] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <><Loader2 size={15} className="animate-spin" /> Adding you…</>
        ) : (
          'Get early access →'
        )}
      </button>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-sm text-[#F87171]">
          <AlertCircle size={14} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      <p className="text-xs text-[#5A6170]">
        No spam. Unsubscribe any time. First 50 get Solo at $199 lifetime.
      </p>
    </form>
  );
}
