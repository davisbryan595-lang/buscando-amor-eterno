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
    { value: 'introvert', label: 'Introvert - I recharge alone' },
    { value: 'ambivert', label: 'Ambivert - Balanced social' },
    { value: 'extrovert', label: 'Extrovert - I love socializing' },
  ]

  const relationshipGoals = [
    { value: 'casual', label: 'Casual Dating' },
    { value: 'serious', label: 'Serious Relationship' },
    { value: 'marriage', label: 'Looking to Marry' },
    { value: 'friendship', label: 'Friendship First' },
  ]

  const interestOptions = [
    'Travel',
    'Sports',
    'Music',
    'Art & Culture',
    'Cooking',
    'Fitness',
    'Reading',
    'Movies',
    'Technology',
    'Nature',
    'Photography',
    'Gaming',
    'Yoga',
    'Volunteering',
    'Fashion',
  ]

  const valueOptions = [
    'Family-oriented',
    'Ambition & Success',
    'Honesty & Integrity',
    'Kindness & Empathy',
    'Independence',
    'Adventure',
    'Stability',
    'Creativity',
    'Health & Wellness',
    'Spirituality',
    'Intelligence',
    'Humor',
  ]

  const handleInterestToggle = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  const handleValueToggle = (value: string) => {
    setValues((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
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
            What's Your Personality Style?
          </Label>
          <div className="space-y-2">
            <Select value={personality} onValueChange={setPersonality}>
              <SelectTrigger className="px-4 py-3 rounded-full border-secondary h-12">
                <SelectValue placeholder="Select your personality" />
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
            What Are You Looking For?
          </Label>
          <div className="space-y-2">
            <Select value={relationshipGoal} onValueChange={setRelationshipGoal}>
              <SelectTrigger className="px-4 py-3 rounded-full border-secondary h-12">
                <SelectValue placeholder="Select your goal" />
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
