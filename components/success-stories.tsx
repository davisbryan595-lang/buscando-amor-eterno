'use client'

import React, { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/lib/i18n-context'

const stories = [
  {
    id: 1,
    coupleKey: 'stories.story1Couple',
    locationKey: 'stories.story1Location',
    storyKey: 'stories.story1Text',
    image: '/happy-couple-wedding-day-love.jpg',
  },
  {
    id: 2,
    coupleKey: 'stories.story2Couple',
    locationKey: 'stories.story2Location',
    storyKey: 'stories.story2Text',
    image: '/romantic-couple-dinner-date.jpg',
  },
  {
    id: 3,
    coupleKey: 'stories.story3Couple',
    locationKey: 'stories.story3Location',
    storyKey: 'stories.story3Text',
    image: '/couple-hugging-sunset-beach.jpg',
  },
  {
    id: 4,
    coupleKey: 'stories.story4Couple',
    locationKey: 'stories.story4Location',
    storyKey: 'stories.story4Text',
    image: '/couple-laughing-park-happy.jpg',
  },
]

export default function SuccessStories() {
  const { t } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const next = () => {
    setCurrentIndex((currentIndex + 1) % stories.length)
  }

  const prev = () => {
    setCurrentIndex((currentIndex - 1 + stories.length) % stories.length)
  }

  useEffect(() => {
    if (!imageRef.current || !contentRef.current) return

    const tl = gsap.timeline()

    if (currentIndex === 0) {
      // Initial load: animate in from opacity 0
      tl.from(imageRef.current, {
        opacity: 0,
        duration: 0.6,
      }, 0)

      tl.from(contentRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.6,
      }, 0.2)
    } else {
      // Story change: fade out and back in
      tl.to(imageRef.current, {
        opacity: 0,
        duration: 0.3,
      }, 0)

      tl.from(imageRef.current, {
        opacity: 0,
        duration: 0.5,
      })

      tl.from(contentRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.5,
      }, 0.2)
    }

    return () => {
      tl.kill()
    }
  }, [currentIndex])

  const story = stories[currentIndex]

  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-background to-background">
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-center mb-3 md:mb-4 text-foreground">
          {t('stories.sectionTitle')}
        </h2>
        <p className="text-center text-muted-foreground mb-10 md:mb-12 text-base md:text-lg">
          {t('stories.sectionDescription')}
        </p>

        <div className="relative soft-glow rounded-2xl overflow-hidden bg-card dark:bg-card">
          <div className="p-4 md:p-6 lg:p-12">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
              <div ref={imageRef} className="w-full md:w-1/2 relative h-56 sm:h-64 md:h-96 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={story.image || "/placeholder.svg"}
                  alt={story.coupleKey}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <div ref={contentRef} className="flex-1 w-full text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <Heart className="text-primary fill-primary w-5 h-5 md:w-6 md:h-6" />
                  <p className="text-primary font-semibold text-base md:text-lg">{t(story.coupleKey)}</p>
                </div>
                <p className="text-sm md:text-base text-muted-foreground mb-4 flex items-center justify-center md:justify-start gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-400"></span>
                  {t(story.locationKey)}
                </p>
                <p className="text-lg md:text-2xl lg:text-3xl font-playfair mb-6 md:mb-8 leading-relaxed italic text-black dark:text-white">
                  "{t(story.storyKey)}"
                </p>

                <div className="flex gap-3 md:gap-4 justify-center md:justify-start">
                  <button
                    onClick={prev}
                    className="p-3 md:p-4 bg-card-subtle dark:bg-card-subtle hover:bg-primary hover:text-white text-primary rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label={t('stories.previousStory')}
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <button
                    onClick={next}
                    className="p-3 md:p-4 bg-card-subtle dark:bg-card-subtle hover:bg-primary hover:text-white text-primary rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label={t('stories.nextStory')}
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 pb-4 md:pb-6">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition ${
                  index === currentIndex ? 'bg-primary w-6 md:w-8' : 'bg-rose-200'
                }`}
                aria-label={`${t('stories.goToStory')} ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
