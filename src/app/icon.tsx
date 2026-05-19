import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 7,
        background: '#FF6B35',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0A0B0E',
        fontWeight: 800,
        fontSize: 19,
        fontFamily: 'sans-serif',
        letterSpacing: '-0.5px',
      }}
    >
      B
    </div>,
    { ...size }
  );
}
