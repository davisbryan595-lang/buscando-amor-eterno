'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '@/lib/i18n-context'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { ChevronDown } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function NuestraHistoriaPage() {
  const { t } = useLanguage()
  const heroRef = useRef<HTMLDivElement>(null)
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const heroSubtitleRef = useRef<HTMLHeadingElement>(null)
  const heroDescriptionRef = useRef<HTMLParagraphElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLElement>(null)

  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; delay: number; duration: number }>>([])

  // Initialize floating hearts
  useEffect(() => {
    const hearts = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      delay: Math.random() * 2,
      duration: 20 + Math.random() * 20,
    }))
    setFloatingHearts(hearts)
  }, [])

  // Hero section animations
  useEffect(() => {
    if (!heroTitleRef.current) return

    const tl = gsap.timeline()

    tl.from(heroTitleRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
    }, 0)

    tl.from(heroSubtitleRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
    }, 0.2)

    tl.from(heroDescriptionRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
    }, 0.4)

    tl.from(scrollIndicatorRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.6,
    }, 0.6)

    return () => {
      tl.kill()
    }
  }, [])

  // Scroll trigger animations for sections
  useEffect(() => {
    const sections = document.querySelectorAll('[data-scroll-animate]')
    
    sections.forEach((section) => {
      const animationType = section.getAttribute('data-scroll-animate')
      
      if (animationType === 'fade-in') {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 30,
          duration: 0.8,
        })
      } else if (animationType === 'fade-in-left') {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          x: -40,
          duration: 0.8,
        })
      } else if (animationType === 'fade-in-right') {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          x: 40,
          duration: 0.8,
        })
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <main ref={pageRef} className="nuestra-historia-page w-full bg-background text-foreground">
      <style>{`
        /* Light theme high contrast text for Our Story page */
        [data-theme="light"] .nuestra-historia-page body,
        [data-theme="light"] .nuestra-historia-page p,
        [data-theme="light"] .nuestra-historia-page span,
        [data-theme="light"] .nuestra-historia-page div {
          color: #222222;
        }

        [data-theme="light"] .nuestra-historia-page h1,
        [data-theme="light"] .nuestra-historia-page h2,
        [data-theme="light"] .nuestra-historia-page h3,
        [data-theme="light"] .nuestra-historia-page h4,
        [data-theme="light"] .nuestra-historia-page h5,
        [data-theme="light"] .nuestra-historia-page h6 {
          color: #000000;
        }
      `}</style>
      <Navigation />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-24"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255,154,162,0.6) 0%, rgba(250,208,196,0.5) 100%), url(/romantic-couple-sunset-beach-luxury.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Floating Hearts Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingHearts.map((heart) => (
            <FloatingHeart
              key={heart.id}
              id={heart.id}
              delay={heart.delay}
              duration={heart.duration}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-4 md:px-6">
          <h1
            ref={heroTitleRef}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-playfair font-bold mb-4 md:mb-6 hero-title-gradient drop-shadow-lg"
          >
            {t('ourStory.heroTitle')}
          </h1>

          <h2
            ref={heroSubtitleRef}
            className="text-2xl sm:text-3xl md:text-4xl font-playfair font-semibold mb-6 md:mb-8 hero-subtitle-gradient"
          >
            {t('ourStory.heroSubtitle')}
          </h2>

          <p
            ref={heroDescriptionRef}
            className="text-base sm:text-lg md:text-xl text-black dark:text-slate-200 drop-shadow-md leading-relaxed max-w-2xl mx-auto"
          >
            {t('ourStory.heroDescription')}
          </p>

          {/* Scroll Indicator */}
          <div
            ref={scrollIndicatorRef}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-sm text-white/80">{t('common.browse')}</span>
            <div className="animate-bounce">
              <ChevronDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-background dark:bg-card-subtle">
        <div className="w-full max-w-3xl mx-auto" data-scroll-animate="fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-center mb-6 md:mb-8 text-foreground">
            {t('ourStory.intro.heading')}
          </h2>

          <div className="mb-12 md:mb-16">
            <p className="text-base sm:text-lg md:text-lg text-black dark:text-slate-200 leading-relaxed">
              {t('ourStory.intro.text')}
            </p>
          </div>
        </div>
      </section>

      {/* Dark Valley Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-background">
        <div className="w-full max-w-5xl mx-auto" data-scroll-animate="fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-center mb-12 md:mb-16 text-foreground">
            {t('ourStory.darkValley.heading')}
          </h2>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            {/* Image - IMAGE 2 */}
            <div
              className="w-full md:w-1/2 relative h-80 sm:h-96 md:h-full rounded-lg overflow-hidden shadow-lg"
              data-scroll-animate="fade-in-left"
            >
              <Image
                src="https://cdn.builder.io/api/v1/image/assets%2F5c758e804cba4fa3a488e9088887877b%2F9b1c248404c849b1a671490fda170ba5?format=webp&width=800"
                alt="Founder with children"
                fill
                className="object-cover object-top hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Text */}
            <div className="w-full md:w-1/2" data-scroll-animate="fade-in-right">
              <p className="text-base sm:text-lg md:text-lg text-black dark:text-slate-200 leading-relaxed">
                {t('ourStory.darkValley.text')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Turning Point Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-b from-background to-card-subtle dark:from-background dark:to-card-subtle">
        <div className="w-full max-w-4xl mx-auto" data-scroll-animate="fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-center mb-8 md:mb-12 text-foreground">
            {t('ourStory.turningPoint.heading')}
          </h2>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Main text */}
            <div className="w-full md:w-2/3">
              <p className="text-base sm:text-lg md:text-lg text-black dark:text-slate-200 leading-relaxed mb-6">
                {t('ourStory.turningPoint.text')}
              </p>

              {/* Pull Quote */}
              <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-400 dark:border-amber-600 pl-6 py-4 my-8 md:my-12 rounded">
                <p className="text-lg md:text-xl font-playfair italic text-amber-900 dark:text-amber-200">
                  "{t('ourStory.turningPoint.quote')}"
                </p>
              </div>
            </div>

            {/* Floating Image - IMAGE 3 */}
            <div className="w-full md:w-1/3 relative h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://cdn.builder.io/api/v1/image/assets%2F5c758e804cba4fa3a488e9088887877b%2Fb04699d61ba5459ab6bb0902175c93f9?format=webp&width=800"
                alt="Family photo"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Finding Love Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-background">
        <div className="w-full max-w-5xl mx-auto" data-scroll-animate="fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-center mb-12 md:mb-16 text-foreground">
            {t('ourStory.findingLove.heading')}
          </h2>

          {/* First part with image */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center mb-12 md:mb-16">
            {/* Image - IMAGE 5 */}
            <div className="w-full md:w-1/2 relative h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden shadow-lg" data-scroll-animate="fade-in-left">
              <Image
                src="https://cdn.builder.io/api/v1/image/assets%2F5c758e804cba4fa3a488e9088887877b%2Fb66d31d272854423b8d551338d58aa49?format=webp&width=800"
                alt="Founder with current wife"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Text */}
            <div className="w-full md:w-1/2" data-scroll-animate="fade-in-right">
              <p className="text-base sm:text-lg md:text-lg text-black dark:text-slate-200 leading-relaxed">
                {t('ourStory.findingLove.textPart1')}
              </p>
            </div>
          </div>

          {/* Second part */}
          <div className="bg-rose-50 dark:bg-rose-900/30 rounded-lg p-8 md:p-12" data-scroll-animate="fade-in">
            <p className="text-base sm:text-lg md:text-lg text-black dark:text-slate-200 leading-relaxed">
              {t('ourStory.findingLove.textPart2')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section
        className="py-16 md:py-24 px-4 md:px-6 relative overflow-hidden bg-gradient-to-r from-primary/10 to-rose-500/10 dark:from-primary/20 dark:to-rose-600/20"
      >
        {/* Floating hearts background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingHearts.map((heart) => (
            <FloatingHeart
              key={`mission-${heart.id}`}
              id={heart.id}
              delay={heart.delay}
              duration={heart.duration}
              opacity={0.08}
            />
          ))}
        </div>

        <div className="w-full max-w-3xl mx-auto text-center relative z-10" data-scroll-animate="fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold mb-6 md:mb-8 text-primary dark:text-rose-300 drop-shadow-lg">
            {t('ourStory.mission.heading')}
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-black dark:text-slate-100 drop-shadow-md leading-relaxed">
            {t('ourStory.mission.text')}
          </p>
        </div>
      </section>

      {/* Closing Quote & CTA Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-background">
        <div className="w-full max-w-2xl mx-auto text-center" data-scroll-animate="fade-in">
          {/* Large Quote */}
          <div className="mb-12 md:mb-16">
            <p className="text-3xl sm:text-4xl md:text-5xl font-playfair italic text-black dark:text-slate-200 leading-relaxed">
              "{t('ourStory.closing.quote')}"
            </p>
          </div>

          {/* Subtext */}
          <div className="mb-8 md:mb-12">
            <p className="text-base sm:text-lg text-foreground mb-2">
              {t('ourStory.closing.subtext1')}
            </p>
            <p className="text-base sm:text-lg text-foreground">
              {t('ourStory.closing.subtext2')}
            </p>
          </div>

          {/* CTA Button */}
          <Link
            href="/browse"
            className="inline-block px-8 md:px-12 py-4 md:py-5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-base md:text-lg rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 soft-glow"
          >
            {t('ourStory.closing.ctaButton')}
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}

// Floating Heart Component
function FloatingHeart({
  id,
  delay,
  duration,
  opacity = 0.1,
}: {
  id: number
  delay: number
  duration: number
  opacity?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    gsap.fromTo(
      containerRef.current,
      {
        y: window.innerHeight + 100,
        opacity: opacity,
        x: Math.random() * window.innerWidth,
      },
      {
        y: -100,
        opacity: 0,
        duration: duration,
        delay: delay,
        ease: 'none',
        repeat: -1,
        repeatDelay: 2,
      }
    )
  }, [delay, duration, opacity])

  return (
    <div ref={containerRef} className="absolute pointer-events-none">
      <HeartSVG />
    </div>
  )
}

// Heart SVG Component
function HeartSVG() {
  const size = Math.random() * 30 + 20
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-rose-400"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
