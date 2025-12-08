'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useLanguage } from '@/lib/i18n-context'
import { useProfile } from '@/hooks/useProfile'
import { Step2Profile } from '@/components/onboarding/step-2-profile'
import { StepPersonality } from '@/components/onboarding/step-0-preferences'
import { Step3Location } from '@/components/onboarding/step-3-location'
import { Step4Photos } from '@/components/onboarding/step-4-photos'
import { Step5Prompts } from '@/components/onboarding/step-5-prompts'
import { Step6Preferences } from '@/components/onboarding/step-6-preferences'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader, ChevronLeft, Globe } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

type OnboardingStep = 2 | 'personality' | 3 | 4 | 5 | 6 | 'complete'

interface OnboardingData {
  // Step 2
  fullName: string
  birthday: string
  gender: string
  lookingFor: string
  // Personality
  personality: string
  relationshipGoal: string
  interests: string[]
  values: string[]
  // Step 3
  city: string
  country: string
  latitude: number
  longitude: number
  // Step 4
  photos: File[]
  // Step 5
  prompt1: string
  prompt2: string
  prompt3: string
  prompt4: string
  loveLanguage: string
  prompt5: string
  prompt6: string
  relationshipType: string
  // Step 6
  ageMin: number
  ageMax: number
  distanceRadius: number
  height: number
  religion: string
  wantsKids: string
  smoking: string
  drinking: string
  dealbreakers: string[]
}

const TOTAL_STEPS = 6

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { t, language, setLanguage } = useLanguage()
  const { createProfile, profile, loading: profileLoading, uploadPhoto } = useProfile()

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(2)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Partial<OnboardingData>>({})

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" size={40} />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getProgressPercent = (step: OnboardingStep) => {
    const stepOrder: Record<OnboardingStep, number> = {
      2: 1,
      'personality': 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      'complete': TOTAL_STEPS,
    }
    return step === 'complete' ? 100 : (stepOrder[step] / TOTAL_STEPS) * 100
  }

  const getStepNumber = (step: OnboardingStep): number => {
    const stepOrder: Record<OnboardingStep, number> = {
      2: 1,
      'personality': 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      'complete': TOTAL_STEPS,
    }
    return stepOrder[step]
  }

  const progressPercent = getProgressPercent(currentStep)
  const stepNumber = getStepNumber(currentStep)

  const handleNext = () => {
    const stepSequence: OnboardingStep[] = [2, 'personality', 3, 4, 5, 6, 'complete']
    const currentIndex = stepSequence.indexOf(currentStep)

    if (currentStep === 6) {
      handleComplete()
    } else {
      const nextIndex = Math.min(currentIndex + 1, stepSequence.length - 1)
      setCurrentStep(stepSequence[nextIndex])
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    const stepSequence: OnboardingStep[] = [2, 'personality', 3, 4, 5, 6, 'complete']
    const currentIndex = stepSequence.indexOf(currentStep)

    if (currentStep !== 2 && currentStep !== 'complete' && currentIndex > 0) {
      setCurrentStep(stepSequence[currentIndex - 1])
      window.scrollTo(0, 0)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // First upload photos if any
      const photoUrls: string[] = []
      if (data.photos && data.photos.length > 0) {
        for (let i = 0; i < data.photos.length; i++) {
          try {
            const url = await uploadPhoto(data.photos[i], i)
            photoUrls.push(url)
          } catch (error) {
            console.error('Failed to upload photo', error)
          }
        }
      }

      await createProfile({
        full_name: data.fullName,
        birthday: data.birthday,
        gender: data.gender,
        looking_for: data.lookingFor,
        personality: data.personality,
        relationship_goal: data.relationshipGoal,
        interests: data.interests,
        values: data.values,
        city: data.city,
        country: data.country,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        photos: photoUrls.length > 0 ? photoUrls : null,
        main_photo_index: photoUrls.length > 0 ? 0 : null,
        prompt_1: data.prompt1,
        prompt_2: data.prompt2,
        prompt_3: data.prompt3,
        prompt_4: data.prompt4,
        love_language: data.loveLanguage,
        prompt_5: data.prompt5,
        prompt_6: data.prompt6,
        relationship_type: data.relationshipType,
        age_range_min: data.ageMin,
        age_range_max: data.ageMax,
        distance_radius: data.distanceRadius,
        height_cm: data.height,
        religion: data.religion,
        wants_kids: data.wantsKids,
        smoking: data.smoking,
        drinking: data.drinking,
        dealbreakers: data.dealbreakers,
        profile_complete: true,
      })

      setCurrentStep('complete')
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-orange-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-secondary">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentStep !== 2 && currentStep !== 'complete' && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="hover:bg-muted"
              >
                <ChevronLeft size={24} />
              </Button>
            )}
            <h1 className="text-xl font-playfair font-bold text-foreground hidden sm:block">
              Buscando Amor Eterno
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {currentStep !== 'complete' && (
              <span className="text-sm font-semibold text-muted-foreground">
                {t('onboarding.progress', {
                  current: stepNumber,
                  total: TOTAL_STEPS,
                })}
              </span>
            )}
            <Button
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              variant="outline"
              size="sm"
              className="border-secondary gap-2"
            >
              <Globe size={16} />
              <span className="font-semibold">{language.toUpperCase()}</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {currentStep !== 'complete' && (
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <Progress value={progressPercent} className="h-1 rounded-full" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Step {currentStep === 'personality' ? 3 : (typeof currentStep === 'number' && currentStep > 2 ? currentStep + 1 : currentStep)} of {TOTAL_STEPS}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-12 pb-20">
        {currentStep === 2 && (
          <Step2Profile
            onNext={handleNext}
            onSkip={handleSkip}
            initialData={{
              fullName: data.fullName || '',
              birthday: data.birthday || '',
              gender: data.gender || '',
              lookingFor: data.lookingFor || '',
            }}
            onDataChange={(stepData) => setData({ ...data, ...stepData })}
          />
        )}

        {currentStep === 'personality' && (
          <StepPersonality
            onNext={handleNext}
            onSkip={handleSkip}
            initialData={{
              personality: data.personality || '',
              relationshipGoal: data.relationshipGoal || '',
              interests: data.interests || [],
              values: data.values || [],
            }}
            onDataChange={(stepData) => setData({ ...data, ...stepData })}
          />
        )}

        {currentStep === 3 && (
          <Step3Location
            onNext={handleNext}
            onSkip={handleSkip}
            initialData={{
              city: data.city || '',
              country: data.country || '',
              latitude: data.latitude || 0,
              longitude: data.longitude || 0,
            }}
            onDataChange={(stepData) => setData({ ...data, ...stepData })}
          />
        )}

        {currentStep === 4 && (
          <Step4Photos
            onNext={handleNext}
            onSkip={handleSkip}
            initialPhotos={data.photos}
            onDataChange={(photos) => setData({ ...data, photos })}
          />
        )}

        {currentStep === 5 && (
          <Step5Prompts
            onNext={handleNext}
            onSkip={handleSkip}
            initialData={{
              prompt1: data.prompt1 || '',
              prompt2: data.prompt2 || '',
              prompt3: data.prompt3 || '',
              prompt4: data.prompt4 || '',
              loveLanguage: data.loveLanguage || '',
              prompt5: data.prompt5 || '',
              prompt6: data.prompt6 || '',
              relationshipType: data.relationshipType || '',
            }}
            onDataChange={(stepData) => setData({ ...data, ...stepData })}
          />
        )}

        {currentStep === 6 && (
          <Step6Preferences
            onNext={handleNext}
            onSkip={handleSkip}
            initialData={{
              ageMin: data.ageMin || 18,
              ageMax: data.ageMax || 60,
              distanceRadius: data.distanceRadius || 50,
              height: data.height || 0,
              religion: data.religion || '',
              wantsKids: data.wantsKids || '',
              smoking: data.smoking || '',
              drinking: data.drinking || '',
              dealbreakers: data.dealbreakers || [],
            }}
            onDataChange={(stepData) => setData({ ...data, ...stepData })}
          />
        )}

        {currentStep === 'complete' && (
          <div className="text-center space-y-8 py-12">
            <div className="space-y-4">
              <div className="text-6xl">🎉</div>
              <h1 className="text-5xl font-playfair font-bold bg-gradient-to-r from-primary via-rose-500 to-orange-500 bg-clip-text text-transparent">
                {t('onboarding.completion.title')}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t('onboarding.completion.subtitle')}
              </p>
            </div>

            <div className="space-y-3 pt-8">
              <Button
                onClick={() => router.push('/browse')}
                size="lg"
                className="w-full py-6 rounded-full bg-primary text-white hover:bg-rose-700 font-semibold text-lg"
              >
                {t('onboarding.completion.startSwiping')}
              </Button>
              <Button
                onClick={() => router.push('/profile')}
                variant="outline"
                size="lg"
                className="w-full py-6 rounded-full border-secondary text-foreground hover:bg-muted font-semibold text-lg"
              >
                {t('onboarding.completion.viewProfile')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center space-y-4">
            <Loader className="animate-spin mx-auto" size={40} />
            <p className="font-semibold text-foreground">Saving your profile...</p>
          </div>
        </div>
      )}
    </div>
  )
}
