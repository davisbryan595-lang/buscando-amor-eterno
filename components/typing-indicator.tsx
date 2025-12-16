'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function TypingIndicator() {
  const dotsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 })

    dotsRef.current.forEach((dot, index) => {
      tl.to(
        dot,
        {
          y: -8,
          duration: 0.4,
          ease: 'sine.inOut',
        },
        index * 0.1
      )
    })

    tl.to(
      dotsRef.current,
      {
        y: 0,
        duration: 0.4,
        ease: 'sine.inOut',
      },
      '0.3'
    )

    return () => tl.kill()
  }, [])

  return (
    <div className="flex gap-2 items-center">
      <div
        ref={(el) => {
          if (el) dotsRef.current[0] = el
        }}
        className="w-3 h-3 bg-slate-400 rounded-full"
      />
      <div
        ref={(el) => {
          if (el) dotsRef.current[1] = el
        }}
        className="w-3 h-3 bg-slate-400 rounded-full"
      />
      <div
        ref={(el) => {
          if (el) dotsRef.current[2] = el
        }}
        className="w-3 h-3 bg-slate-400 rounded-full"
      />
    </div>
  )
}
