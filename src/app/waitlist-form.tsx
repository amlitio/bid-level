'use client';
import { useState } from 'react';

export default function WaitlistForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form)),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      setStatus('success');
    } else {
      setError((await res.json()).error || 'Something went wrong');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-[#4ADE80] bg-[#4ADE80]/10 p-6 rounded">
        <div className="font-semibold mb-2">You&apos;re on the list.</div>
        <div className="text-sm text-[#8B92A0]">
          We&apos;ll send your beta invite within 24 hours. Check your inbox — including spam — for a note from hello@bidlevel.app.
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
        className="w-full bg-[#13161B] border border-[#2A2F38] rounded px-4 py-3 focus:border-[#FF6B35] focus:outline-none"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="full_name"
          placeholder="name"
          className="bg-[#13161B] border border-[#2A2F38] rounded px-4 py-3 focus:border-[#FF6B35] focus:outline-none"
        />
        <input
          name="company"
          placeholder="company"
          className="bg-[#13161B] border border-[#2A2F38] rounded px-4 py-3 focus:border-[#FF6B35] focus:outline-none"
        />
      </div>
      <select
        name="role"
        className="w-full bg-[#13161B] border border-[#2A2F38] rounded px-4 py-3 focus:border-[#FF6B35] focus:outline-none"
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
        className="w-full bg-[#13161B] border border-[#2A2F38] rounded px-4 py-3 focus:border-[#FF6B35] focus:outline-none"
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
        className="w-full bg-[#FF6B35] text-[#0A0B0E] font-semibold py-3 rounded hover:bg-[#FF7E4D] transition disabled:opacity-50"
      >
        {status === 'loading' ? 'Adding you…' : 'Get early access'}
      </button>
      {status === 'error' && (
        <div className="text-sm text-[#F87171]">{error}</div>
      )}
    </form>
  );
}
