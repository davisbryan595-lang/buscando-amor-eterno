'use client'

import React, { useEffect, useState, useRef } from 'react'

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<number[]>([])
  const heartTimeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const interval = setInterval(() => {
      const newHeart = Date.now()
      setHearts((prev) => [...prev, newHeart])

      // Remove heart after animation completes
      const timeout = setTimeout(() => {
        setHearts((prev) => prev.filter((heart) => heart !== newHeart))
        heartTimeoutsRef.current.delete(newHeart)
      }, 6000)

      heartTimeoutsRef.current.set(newHeart, timeout)
    }, 800)

    return () => {
      clearInterval(interval)
      heartTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
      heartTimeoutsRef.current.clear()
    }
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
