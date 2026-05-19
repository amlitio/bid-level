'use client';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

function DemoSkeleton() {
  return (
    <div style={{
      height: '100%',
      background: '#0A0B0E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      color: '#8B92A0',
    }}>
      <Loader2 size={24} color="#FF6B35" style={{ animation: 'spin 1s linear infinite' }} />
      <div style={{ fontSize: 13, fontFamily: '"IBM Plex Mono", monospace' }}>
        Loading IFC renderer…
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const DemoPage = dynamic(() => import('./demo/page'), {
  ssr: false,
  loading: DemoSkeleton,
});

export default function DemoSection() {
  return <div style={{ height: '100%' }}><DemoPage /></div>;
}
