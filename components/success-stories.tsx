'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/lib/i18n-context'

const stories = [
  {
    id: 1,
    coupleKey: 'Maria & Carlos',
    locationKey: 'Barcelona, Spain',
    storyKey: 'Met on Buscando Amor Eterno in March. Engaged in December. True soulmates.',
    image: '/happy-couple-wedding-day-love.jpg',
  },
  {
    id: 2,
    coupleKey: 'Sophie & Luis',
    locationKey: 'Mexico City, Mexico',
    storyKey: 'Found each other across continents. Now married for 3 years.',
    image: '/romantic-couple-dinner-date.jpg',
  },
  {
    id: 3,
    coupleKey: 'Isabella & Marco',
    locationKey: 'Buenos Aires, Argentina',
    storyKey: 'From first message to wedding day. Our forever love story.',
    image: '/couple-hugging-sunset-beach.jpg',
  },
  {
    id: 4,
    coupleKey: 'Elena & Diego',
    locationKey: 'Madrid, Spain',
    storyKey: 'Two years together and growing stronger every day.',
    image: '/couple-laughing-park-happy.jpg',
  },
]

export default function SuccessStories() {
  const { t } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((currentIndex + 1) % stories.length)
  }

  const prev = () => {
    setCurrentIndex((currentIndex - 1 + stories.length) % stories.length)
  }

  const story = stories[currentIndex]

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-rose-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-center mb-4 text-slate-900">
          {t('stories.sectionTitle')}
        </h2>
        <p className="text-center text-slate-600 mb-12 text-lg">
          {t('stories.sectionDescription')}
        </p>

        <div className="relative soft-glow rounded-2xl overflow-hidden bg-white">
          <div className="p-6 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/2 relative h-64 md:h-96 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={story.image || "/placeholder.svg"}
                  alt={story.coupleKey}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <Heart className="text-primary fill-primary" size={24} />
                  <p className="text-primary font-semibold text-lg">{story.coupleKey}</p>
                </div>
                <p className="text-slate-600 mb-4 flex items-center justify-center md:justify-start gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-rose-400"></span>
                  {story.locationKey}
                </p>
                <p className="text-xl md:text-3xl font-playfair text-slate-900 mb-8 leading-relaxed italic">
                  "{story.storyKey}"
                </p>

                <div className="flex gap-4 justify-center md:justify-start">
                  <button
                    onClick={prev}
                    className="p-4 bg-rose-50 hover:bg-primary hover:text-white text-primary rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label={t('stories.previousStory')}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={next}
                    className="p-4 bg-rose-50 hover:bg-primary hover:text-white text-primary rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label={t('stories.nextStory')}
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel indicators */}
          <div className="flex justify-center gap-2 pb-6">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition ${
                  index === currentIndex ? 'bg-primary w-8' : 'bg-rose-200'
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
