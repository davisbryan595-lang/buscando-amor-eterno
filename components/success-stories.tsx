'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import Image from 'next/image'

const stories = [
  {
    id: 1,
    couple: 'Maria & Carlos',
    location: 'Barcelona, Spain',
    story: 'Met on Buscando Amor Eterno in March. Engaged in December. True soulmates.',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400&h=400&fit=crop',
  },
  {
    id: 2,
    couple: 'Sophie & Luis',
    location: 'Mexico City, Mexico',
    story: 'Found each other across continents. Now married for 3 years.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
  {
    id: 3,
    couple: 'Isabella & Marco',
    location: 'Buenos Aires, Argentina',
    story: 'From first message to wedding day. Our forever love story.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
  {
    id: 4,
    couple: 'Elena & Diego',
    location: 'Madrid, Spain',
    story: 'Two years together and growing stronger every day.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  },
]

export default function SuccessStories() {
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
          Love Stories
        </h2>
        <p className="text-center text-slate-600 mb-12 text-lg">
          Real connections, real love, real forever
        </p>

        <div className="relative soft-glow rounded-2xl overflow-hidden">
          <div className="bg-white p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <img
                  src={story.image || "/placeholder.svg"}
                  alt={story.couple}
                  className="w-full h-64 object-cover rounded-xl soft-glow"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="text-primary fill-primary" size={24} />
                  <p className="text-primary font-semibold">{story.couple}</p>
                </div>
                <p className="text-slate-600 mb-2">{story.location}</p>
                <p className="text-xl md:text-2xl font-playfair text-slate-900 mb-6 leading-relaxed">
                  "{story.story}"
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={prev}
                    className="p-3 bg-rose-100 hover:bg-primary hover:text-white text-primary rounded-full transition"
                    aria-label="Previous story"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={next}
                    className="p-3 bg-rose-100 hover:bg-primary hover:text-white text-primary rounded-full transition"
                    aria-label="Next story"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {stories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition ${
                  index === currentIndex ? 'bg-primary w-8' : 'bg-rose-200'
                }`}
                aria-label={`Go to story ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
