'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}


export function MorphingBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const blob1Ref = useRef<HTMLDivElement>(null)
  const blob2Ref = useRef<HTMLDivElement>(null)
  const blob3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const blob1 = blob1Ref.current
    const blob2 = blob2Ref.current
    const blob3 = blob3Ref.current

    if (!container || !blob1 || !blob2 || !blob3) return

    const ctx = gsap.context(() => {
      // Continuous floating animation for blobs
      gsap.to(blob1, {
        x: '+=50',
        y: '+=30',
        duration: 8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      gsap.to(blob2, {
        x: '-=40',
        y: '+=50',
        duration: 10,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      gsap.to(blob3, {
        x: '+=30',
        y: '-=40',
        duration: 12,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      // Morphing shape animation
      gsap.to(blob1, {
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        duration: 6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      gsap.to(blob2, {
        borderRadius: '40% 60% 70% 30% / 40% 70% 30% 60%',
        duration: 8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      gsap.to(blob3, {
        borderRadius: '50% 50% 30% 70% / 50% 40% 60% 50%',
        duration: 7,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })


      // Parallax effect on blobs based on scroll
      gsap.to(blob1, {
        y: -200,
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 2,
        },
      })

      gsap.to(blob2, {
        y: -300,
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 3,
        },
      })

      gsap.to(blob3, {
        y: -150,
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: '#F0F7FF',
      }}
    >
      {/* Animated blob 1 - blue */}
      <div
        ref={blob1Ref}
        className="absolute w-[800px] h-[800px] -top-40 -left-40"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          filter: 'blur(30px)',
        }}
      />

      {/* Animated blob 2 - purple */}
      <div
        ref={blob2Ref}
        className="absolute w-[700px] h-[700px] top-1/4 -right-40"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, rgba(147, 51, 234, 0.1) 50%, transparent 70%)',
          borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
          filter: 'blur(30px)',
        }}
      />

      {/* Animated blob 3 - cyan */}
      <div
        ref={blob3Ref}
        className="absolute w-[600px] h-[600px] bottom-1/3 left-1/3"
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
