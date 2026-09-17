'use client'

import { useEffect, useState, ReactNode } from 'react'

export function PageTransition({ children, trigger }: { children: ReactNode; trigger: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(false)
    const timer = requestAnimationFrame(() => {
      setVisible(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [trigger])

  return (
    <div
      className={`transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  )
}
