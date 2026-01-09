'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkles, Target, Heart, Lightbulb } from 'lucide-react'

interface StepPersonalityProps {
  onNext: () => void
  onSkip: () => void
  initialData?: {
    personality: string
    relationshipGoal: string
    interests: string[]
    values: string[]
  }
  onDataChange: (data: {
    personality: string
    relationshipGoal: string
    interests: string[]
    values: string[]
  }) => void
}

export function StepPersonality({
  onNext,
  onSkip,
  initialData,
  onDataChange,
}: StepPersonalityProps) {
  const { t } = useLanguage()
  const [personality, setPersonality] = useState(initialData?.personality || '')
  const [relationshipGoal, setRelationshipGoal] = useState(initialData?.relationshipGoal || '')
  const [interests, setInterests] = useState(initialData?.interests || [])
  const [values, setValues] = useState(initialData?.values || [])

  const personalityOptions = [
    { value: 'introvert', label: t('onboarding.step0.introvert') },
    { value: 'ambivert', label: t('onboarding.step0.ambivert') },
    { value: 'extrovert', label: t('onboarding.step0.extrovert') },
  ]

  const relationshipGoals = [
    { value: 'casual', label: t('onboarding.step0.casualDating') },
    { value: 'serious', label: t('onboarding.step0.seriousRelationship') },
    { value: 'marriage', label: t('onboarding.step0.lookingToMarry') },
    { value: 'friendship', label: t('onboarding.step0.friendshipFirst') },
  ]

  const interestOptions = [
    { key: 'travel', label: t('onboarding.step0.travel') },
    { key: 'sports', label: t('onboarding.step0.sports') },
    { key: 'music', label: t('onboarding.step0.music') },
    { key: 'artCulture', label: t('onboarding.step0.artCulture') },
    { key: 'cooking', label: t('onboarding.step0.cooking') },
    { key: 'fitness', label: t('onboarding.step0.fitness') },
    { key: 'reading', label: t('onboarding.step0.reading') },
    { key: 'movies', label: t('onboarding.step0.movies') },
    { key: 'technology', label: t('onboarding.step0.technology') },
    { key: 'nature', label: t('onboarding.step0.nature') },
    { key: 'photography', label: t('onboarding.step0.photography') },
    { key: 'gaming', label: t('onboarding.step0.gaming') },
    { key: 'yoga', label: t('onboarding.step0.yoga') },
    { key: 'volunteering', label: t('onboarding.step0.volunteering') },
    { key: 'fashion', label: t('onboarding.step0.fashion') },
  ]

  const valueOptions = [
    { key: 'familyOriented', label: t('onboarding.step0.familyOriented') },
    { key: 'ambitionSuccess', label: t('onboarding.step0.ambitionSuccess') },
    { key: 'honestyIntegrity', label: t('onboarding.step0.honestyIntegrity') },
    { key: 'kindnessEmpathy', label: t('onboarding.step0.kindnessEmpathy') },
    { key: 'independence', label: t('onboarding.step0.independence') },
    { key: 'adventure', label: t('onboarding.step0.adventure') },
    { key: 'stability', label: t('onboarding.step0.stability') },
    { key: 'creativity', label: t('onboarding.step0.creativity') },
    { key: 'healthWellness', label: t('onboarding.step0.healthWellness') },
    { key: 'spirituality', label: t('onboarding.step0.spirituality') },
    { key: 'intelligence', label: t('onboarding.step0.intelligence') },
    { key: 'humor', label: t('onboarding.step0.humor') },
  ]

  const handleInterestToggle = (interestKey: string) => {
    setInterests((prev) =>
      prev.includes(interestKey)
        ? prev.filter((i) => i !== interestKey)
        : [...prev, interestKey]
    )
  }

  const handleValueToggle = (valueKey: string) => {
    setValues((prev) =>
      prev.includes(valueKey)
        ? prev.filter((v) => v !== valueKey)
        : [...prev, valueKey]
    )
  }

  const handleNext = () => {
    onDataChange({ personality, relationshipGoal, interests, values })
    onNext()
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-playfair font-bold text-foreground">
          Let's Get to Know You
        </h1>
        <p className="text-lg text-muted-foreground">
          Help us find your perfect match
        </p>
      </div>

      <div className="space-y-8">
        {/* Personality */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles size={20} className="text-primary" />
            {t('onboarding.step0.personality')}
          </Label>
          <div className="space-y-2">
            <Select value={personality} onValueChange={setPersonality}>
              <SelectTrigger className="px-4 py-3 rounded-full border-secondary h-12">
                <SelectValue placeholder={t('onboarding.step0.personality')} />
              </SelectTrigger>
              <SelectContent>
                {personalityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Relationship Goal */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-lg font-semibold">
            <Target size={20} className="text-primary" />
            {t('onboarding.step0.relationshipGoal')}
          </Label>
          <div className="space-y-2">
            <Select value={relationshipGoal} onValueChange={setRelationshipGoal}>
              <SelectTrigger className="px-4 py-3 rounded-full border-secondary h-12">
                <SelectValue placeholder={t('onboarding.step0.relationshipGoal')} />
              </SelectTrigger>
              <SelectContent>
                {relationshipGoals.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-lg font-semibold">
            <Heart size={20} className="text-primary" />
            Your Interests (Select at least 3)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {interestOptions.map((interest) => (
              <div key={interest} className="flex items-center space-x-2">
                <Checkbox
                  id={interest}
                  checked={interests.includes(interest)}
                  onCheckedChange={() => handleInterestToggle(interest)}
                  className="rounded"
                />
                <Label
                  htmlFor={interest}
                  className="text-sm font-normal cursor-pointer text-foreground"
                >
                  {interest}
                </Label>
              </div>
            ))}
          </div>
          {interests.length < 3 && (
            <p className="text-sm text-amber-600">
              Please select at least 3 interests
            </p>
          )}
        </div>

        {/* Values */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-lg font-semibold">
            <Lightbulb size={20} className="text-primary" />
            Your Core Values (Select at least 2)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {valueOptions.map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={value}
                  checked={values.includes(value)}
                  onCheckedChange={() => handleValueToggle(value)}
                  className="rounded"
                />
                <Label
                  htmlFor={value}
                  className="text-sm font-normal cursor-pointer text-foreground"
                >
                  {value}
                </Label>
              </div>
            ))}
          </div>
          {values.length < 2 && (
            <p className="text-sm text-amber-600">
              Please select at least 2 values
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={onSkip}
          variant="outline"
          className="flex-1 py-3 rounded-full border-secondary text-foreground hover:bg-muted"
        >
          Skip for Now
        </Button>
        <Button
          onClick={handleNext}
          disabled={interests.length < 3 || values.length < 2}
          className="flex-1 py-3 rounded-full bg-primary text-white hover:bg-rose-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
