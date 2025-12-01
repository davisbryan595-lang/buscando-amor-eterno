'use client'

import React, { useEffect, useState } from 'react'

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const newHeart = Date.now()
      setHearts((prev) => [...prev, newHeart])

      // Remove heart after animation completes
      setTimeout(() => {
        setHearts((prev) => prev.filter((heart) => heart !== newHeart))
      }, 6000)
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {hearts.map((heart) => (
        <div
          key={heart}
          className="fixed pointer-events-none animate-float-hearts text-rose-400 opacity-60 z-50"
          style={{
            left: Math.random() * 100 + '%',
            top: '100vh',
            fontSize: Math.random() * 20 + 20 + 'px',
          }}
        >
          ♥
        </div>
      ))}
    </>
  )
}
