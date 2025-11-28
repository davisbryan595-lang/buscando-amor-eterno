'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Heart, MessageCircle } from 'lucide-react'

const MAX_CHAR = 150
const MIN_CHAR = 20

interface Step5Props {
  onNext: () => void
  onSkip: () => void
  initialData?: {
    prompt1: string
    prompt2: string
    prompt3: string
    prompt4: string
    loveLanguage: string
    prompt5: string
    prompt6: string
    relationshipType: string
  }
  onDataChange: (data: {
    prompt1: string
    prompt2: string
    prompt3: string
    prompt4: string
    loveLanguage: string
    prompt5: string
    prompt6: string
    relationshipType: string
  }) => void
}

export function Step5Prompts({
  onNext,
  onSkip,
  initialData,
  onDataChange,
}: Step5Props) {
  const { t } = useLanguage()
  const [prompt1, setPrompt1] = useState(initialData?.prompt1 || '')
  const [prompt2, setPrompt2] = useState(initialData?.prompt2 || '')
  const [prompt3, setPrompt3] = useState(initialData?.prompt3 || '')
  const [prompt4, setPrompt4] = useState(initialData?.prompt4 || '')
  const [loveLanguage, setLoveLanguage] = useState(initialData?.loveLanguage || '')
  const [prompt5, setPrompt5] = useState(initialData?.prompt5 || '')
  const [prompt6, setPrompt6] = useState(initialData?.prompt6 || '')
  const [relationshipType, setRelationshipType] = useState(
    initialData?.relationshipType || ''
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const prompts = [
      { value: prompt1, key: 'prompt1' },
      { value: prompt2, key: 'prompt2' },
      { value: prompt3, key: 'prompt3' },
      { value: prompt4, key: 'prompt4' },
      { value: prompt5, key: 'prompt5' },
      { value: prompt6, key: 'prompt6' },
    ]

    prompts.forEach((p) => {
      if (!p.value.trim() || p.value.trim().length < MIN_CHAR) {
        newErrors[p.key] = t('onboarding.step5.minChars')
      }
    })

    if (!loveLanguage) {
      newErrors.loveLanguage = 'Love language is required'
    }

    if (!relationshipType) {
      newErrors.relationshipType = 'Relationship type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onDataChange({
        prompt1,
        prompt2,
        prompt3,
        prompt4,
        loveLanguage,
        prompt5,
        prompt6,
        relationshipType,
      })
      onNext()
    }
  }

  const PromptField = ({
    label,
    value,
    onChange,
    error,
  }: {
    label: string
    value: string
    onChange: (v: string) => void
    error?: string
  }) => (
    <div className="space-y-2">
      <Label className="flex items-start gap-2">
        <MessageCircle size={18} className="text-primary mt-1 flex-shrink-0" />
        <span>{label}</span>
      </Label>
      <Textarea
        placeholder="Type your answer..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX_CHAR}
        className={`px-4 py-3 rounded-2xl min-h-[100px] resize-none ${
          error ? 'border-destructive' : 'border-secondary'
        }`}
      />
      <div className="flex items-center justify-between text-xs">
        <span className={value.length < MIN_CHAR ? 'text-destructive' : 'text-muted-foreground'}>
          {value.length}/{MAX_CHAR}
        </span>
        {error && <span className="text-destructive">{error}</span>}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-playfair font-bold text-foreground">
          {t('onboarding.step5.title')}
        </h1>
        <p className="text-lg text-muted-foreground">{t('onboarding.step5.subtitle')}</p>
      </div>

      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
        <PromptField
          label={t('onboarding.step5.prompt1')}
          value={prompt1}
          onChange={setPrompt1}
          error={errors.prompt1}
        />

        <PromptField
          label={t('onboarding.step5.prompt2')}
          value={prompt2}
          onChange={setPrompt2}
          error={errors.prompt2}
        />

        <PromptField
          label={t('onboarding.step5.prompt3')}
          value={prompt3}
          onChange={setPrompt3}
          error={errors.prompt3}
        />

        <div className="space-y-2">
          <Label htmlFor="loveLanguage" className="flex items-center gap-2">
            <Heart size={18} className="text-primary" />
            {t('onboarding.step5.prompt4')}
          </Label>
          <Select value={loveLanguage} onValueChange={setLoveLanguage}>
            <SelectTrigger className="px-4 py-3 rounded-full border-secondary">
              <SelectValue placeholder={t('onboarding.step5.loveLanguageLabel')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="words">{t('onboarding.step5.words')}</SelectItem>
              <SelectItem value="quality">{t('onboarding.step5.quality')}</SelectItem>
              <SelectItem value="gifts">{t('onboarding.step5.gifts')}</SelectItem>
              <SelectItem value="acts">{t('onboarding.step5.acts')}</SelectItem>
              <SelectItem value="touch">{t('onboarding.step5.touch')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.loveLanguage && (
            <p className="text-sm text-destructive">{errors.loveLanguage}</p>
          )}
        </div>

        <PromptField
          label={t('onboarding.step5.prompt5')}
          value={prompt5}
          onChange={setPrompt5}
          error={errors.prompt5}
        />

        <div className="space-y-2">
          <Label htmlFor="relationshipType" className="flex items-center gap-2">
            <Heart size={18} className="text-primary" />
            {t('onboarding.step5.prompt6')}
          </Label>
          <Select value={relationshipType} onValueChange={setRelationshipType}>
            <SelectTrigger className="px-4 py-3 rounded-full border-secondary">
              <SelectValue placeholder={t('onboarding.step5.relationshipTypeLabel')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="serious">
                {t('onboarding.step5.seriousRelationship')}
              </SelectItem>
              <SelectItem value="marriage">{t('onboarding.step5.marriage')}</SelectItem>
              <SelectItem value="friendship">
                {t('onboarding.step5.deepFriendship')}
              </SelectItem>
              <SelectItem value="exploring">{t('onboarding.step5.stillExploring')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.relationshipType && (
            <p className="text-sm text-destructive">{errors.relationshipType}</p>
          )}
        </div>

        <PromptField
          label={t('onboarding.step5.prompt6')}
          value={prompt6}
          onChange={setPrompt6}
          error={errors.prompt6}
        />
      </div>

      <div className="flex gap-4">
        <Button
          onClick={onSkip}
          variant="outline"
          className="flex-1 py-3 rounded-full border-secondary text-foreground hover:bg-muted"
        >
          {t('onboarding.skipForNow')}
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 py-3 rounded-full bg-primary text-white hover:bg-rose-700 font-semibold"
        >
          {t('onboarding.nextStep')}
        </Button>
      </div>
    </div>
  )
}
