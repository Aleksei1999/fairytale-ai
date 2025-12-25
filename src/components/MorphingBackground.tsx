'use client'

export function MorphingBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: '#F0F7FF',
      }}
    >
      {/* Animated blob 1 - blue */}
      <div
        className="absolute w-[800px] h-[800px] -top-40 -left-40 animate-blob-1"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          filter: 'blur(30px)',
        }}
      />

      {/* Animated blob 2 - purple */}
      <div
        className="absolute w-[700px] h-[700px] top-1/4 -right-40 animate-blob-2"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, rgba(147, 51, 234, 0.1) 50%, transparent 70%)',
          borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
          filter: 'blur(30px)',
        }}
      />

      {/* Animated blob 3 - cyan */}
      <div
        className="absolute w-[600px] h-[600px] bottom-1/3 left-1/3 animate-blob-3"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, rgba(34, 211, 238, 0.1) 50%, transparent 70%)',
          borderRadius: '50% 50% 30% 70% / 50% 40% 60% 50%',
          filter: 'blur(30px)',
        }}
      />

      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
