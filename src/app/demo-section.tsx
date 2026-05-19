'use client';
import dynamic from 'next/dynamic';

const DemoPage = dynamic(() => import('./demo/page'), { ssr: false });

export default function DemoSection() {
  return <DemoPage />;
}
