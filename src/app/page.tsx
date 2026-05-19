import { Box, Layers, FileSpreadsheet, GitCompare, Zap, Globe } from 'lucide-react';
import WaitlistForm from './waitlist-form';
import DemoSection from './demo-section';

export default function Home() {
  return (
    <main className="bg-[#0A0B0E] text-[#E8EAED] min-h-screen">
      {/* HERO */}
      <section className="px-6 pt-20 pb-12 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded bg-[#FF6B35] flex items-center justify-center">
            <Box size={16} strokeWidth={2.5} color="#0A0B0E" />
          </div>
          <span className="text-sm font-bold tracking-wider">BID<span className="text-[#FF6B35]">LEVEL</span></span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] max-w-4xl">
          IFC takeoff in your browser.
          <span className="text-[#5A6170] block">No Revit. No Navisworks. No install.</span>
        </h1>

        <p className="text-lg text-[#8B92A0] mt-6 max-w-2xl leading-relaxed">
          Drop a BIM model. Get a bid-ready takeoff in 60 seconds. Click any line item — see exactly which elements it counted. Compare revisions and catch margin-erosion before it costs you.
        </p>

        <div className="flex gap-3 mt-10">
          <a href="#demo" className="bg-[#FF6B35] text-[#0A0B0E] px-6 py-3 rounded font-semibold hover:bg-[#FF7E4D] transition">
            Try the demo →
          </a>
          <a href="#waitlist" className="border border-[#2A2F38] px-6 py-3 rounded font-medium hover:border-[#3A414C] transition">
            Join waitlist
          </a>
        </div>

        <div className="flex gap-6 mt-12 text-xs text-[#5A6170] font-mono">
          <span>IFC 2x3 · 4.0 · 4.3 · 5</span>
          <span>·</span>
          <span>CSI MasterFormat 2018</span>
          <span>·</span>
          <span>WebGL renderer</span>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" className="border-y border-[#2A2F38] h-screen">
        <DemoSection />
      </section>

      {/* FEATURES */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-16 max-w-2xl">
          Built for the way estimators actually work.
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2A2F38]">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-[#0A0B0E] p-8">
              <f.icon size={20} className="text-[#FF6B35] mb-4" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-[#8B92A0] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-4">Pricing</h2>
        <p className="text-[#8B92A0] mb-12">First 50 paid signups get Solo at $199 lifetime.</p>
        <div className="grid md:grid-cols-3 gap-px bg-[#2A2F38]">
          {TIERS.map(t => (
            <div key={t.name} className={`bg-[#0A0B0E] p-8 ${t.featured ? 'border-2 border-[#FF6B35]' : ''}`}>
              <div className="text-xs text-[#8B92A0] mb-2 tracking-wider uppercase">{t.name}</div>
              <div className="text-4xl font-bold mb-1 font-mono">{t.price}</div>
              <div className="text-xs text-[#5A6170] mb-6">{t.unit}</div>
              <ul className="space-y-2 text-sm text-[#E8EAED]">
                {t.features.map(f => <li key={f}>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" className="px-6 py-24 max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold mb-4">Get early access.</h2>
        <p className="text-[#8B92A0] mb-8">
          We&apos;re inviting the first 50 estimators into the beta. Drop your email and we&apos;ll reach out within 24 hours.
        </p>
        <WaitlistForm />
      </section>

      <footer className="border-t border-[#2A2F38] px-6 py-8 text-xs text-[#5A6170] max-w-6xl mx-auto">
        © 2026 Bid Level · Built for SMB contractors ·{' '}
        <a href="mailto:hello@bidlevel.app" className="hover:text-[#E8EAED]">hello@bidlevel.app</a>
      </footer>
    </main>
  );
}

const FEATURES = [
  { icon: Zap,             title: '60-second takeoffs',    desc: 'Drop an IFC file. The full quantity schedule populates while you wait for your coffee.' },
  { icon: Layers,          title: 'Click-to-verify',        desc: 'Tap any line item — those exact elements light up in the 3D model. No more guessing what the software counted.' },
  { icon: GitCompare,      title: 'Revision diff',          desc: 'Architect sent v3? We compute the cost-impact delta vs v2. Catch margin erosion before signing.' },
  { icon: FileSpreadsheet, title: 'Bid-ready exports',      desc: 'CSV and Excel with formulas, formatted for your existing bidding templates. Drop straight into your workflow.' },
  { icon: Globe,           title: 'Pure browser',           desc: 'Works on the laptop you already have. No Revit license. No Navisworks install. No IT ticket.' },
  { icon: Box,             title: 'CSI native',             desc: 'Groups by MasterFormat 2018 divisions. Speaks the language estimators actually use.' },
];

const TIERS = [
  { name: 'Free',  price: '$0',   unit: 'forever',                   featured: false, features: ['1 active project', 'CSV export', '50MB file size', 'CSI MasterFormat grouping'] },
  { name: 'Solo',  price: '$79',  unit: 'per month, billed monthly', featured: true,  features: ['Unlimited projects', 'All exports (CSV, Excel, PDF)', '500MB file size', 'Revision diff', 'Priority parsing'] },
  { name: 'Team',  price: '$199', unit: 'per month, up to 5 seats',  featured: false, features: ['Everything in Solo', '5 user seats', 'Project sharing', 'Version history', '1GB file size', 'Branded exports'] },
];
