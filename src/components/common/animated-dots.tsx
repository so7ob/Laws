'use client'

/**
 * Animated floating dots background - inspired by uaelegislation.gov.ae
 * Renders multiple dots of varying sizes, positions, and speeds
 * that float across the background smoothly.
 */
export function AnimatedDots({ count = 30 }: { count?: number }) {
  // Generate deterministic positions for dots
  const dots = Array.from({ length: count }, (_, i) => {
    const seed = (i * 73) % 100
    const left = (seed * 1.37) % 100
    const top = ((seed * 2.71) % 100)
    const size = 1 + (seed % 4) // 1-4px
    const duration = 8 + (seed % 12) // 8-20s
    const delay = -(seed % 10) * 0.8 // negative delay for immediate start at different points
    const opacity = 0.1 + (seed % 5) * 0.08 // 0.1 - 0.5
    const drift = (seed % 2 === 0 ? 1 : -1) * (10 + (seed % 30)) // horizontal drift in px
    
    return { id: i, left, top, size, duration, delay, opacity, drift }
  })

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes dot-float {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: var(--dot-opacity);
          }
          25% {
            transform: translate(var(--drift-x), -30px) scale(1.2);
            opacity: calc(var(--dot-opacity) * 1.5);
          }
          50% {
            transform: translate(calc(var(--drift-x) * 0.5), -60px) scale(0.8);
            opacity: var(--dot-opacity);
          }
          75% {
            transform: translate(calc(var(--drift-x) * -0.5), -30px) scale(1.1);
            opacity: calc(var(--dot-opacity) * 1.3);
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: var(--dot-opacity);
          }
        }
        @keyframes dot-drift {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(15px, -20px);
          }
          66% {
            transform: translate(-10px, 15px);
          }
        }
      `}</style>
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${dot.left}%`,
            top: `${dot.top}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            opacity: dot.opacity,
            ['--dot-opacity' as string]: dot.opacity,
            ['--drift-x' as string]: `${dot.drift}px`,
            animation: `dot-float ${dot.duration}s ease-in-out ${dot.delay}s infinite, dot-drift ${dot.duration * 1.5}s ease-in-out ${dot.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
