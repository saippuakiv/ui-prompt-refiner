'use client';

export function GradientBackground() {
  return (
    <>
      {/* Ellipse glow - yellow to red, center */}
      <div
        className='absolute pointer-events-none'
        style={{
          left: 'calc(50% - 200px)',
          top: 'calc(50% - 200px)',
          width: 508,
          height: 508,
        }}
      >
        <div
          className='w-full h-full rounded-full'
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 242, 0, 0.62) 0%, rgba(255, 0, 77, 0) 100%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Ellipse glow - blue/purple, top-left */}
      <div
        className='absolute pointer-events-none'
        style={{
          left: 'calc(30% - 50px)',
          top: 'calc(20% - 200px)',
          width: 533,
          height: 533,
        }}
      >
        <div
          className='w-full h-full rounded-full'
          style={{
            background:
              'linear-gradient(180deg, #3700FF 0%, rgba(255, 242, 0, 0.1) 100%)',
            filter: 'blur(100px)',
          }}
        />
      </div>
    </>
  );
}
