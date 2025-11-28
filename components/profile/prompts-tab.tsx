'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/lib/i18n-context'
import { useProfile, ProfileData } from '@/hooks/useProfile'
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
import { Loader } from 'lucide-react'
import { toast } from 'sonner'

const MAX_CHAR = 150
const MIN_CHAR = 20

interface PromptsTabProps {
  profile: ProfileData
  onUpdate: () => void
}

export function ProfilePromptsTab({ profile, onUpdate }: PromptsTabProps) {
  const { t } = useLanguage()
  const { updateProfile } = useProfile()

  const [prompt1, setPrompt1] = useState(profile.prompt_1 || '')
  const [prompt2, setPrompt2] = useState(profile.prompt_2 || '')
  const [prompt3, setPrompt3] = useState(profile.prompt_3 || '')
  const [prompt4, setPrompt4] = useState(profile.prompt_4 || '')
  const [loveLanguage, setLoveLanguage] = useState(profile.love_language || '')
  const [prompt5, setPrompt5] = useState(profile.prompt_5 || '')
  const [prompt6, setPrompt6] = useState(profile.prompt_6 || '')
  const [relationshipType, setRelationshipType] = useState(profile.relationship_type || '')
  const [saving, setSaving] = useState(false)
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      await updateProfile({
        prompt_1: prompt1,
        prompt_2: prompt2,
        prompt_3: prompt3,
        prompt_4: prompt4,
        love_language: loveLanguage,
        prompt_5: prompt5,
        prompt_6: prompt6,
        relationship_type: relationshipType,
      })
      toast.success(t('profile.saveSuccess'))
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || t('profile.saveFailed'))
    } finally {
      setSaving(false)
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
      <Label>{label}</Label>
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
    <div className="space-y-6">
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
        <Label>{t('onboarding.step5.prompt4')}</Label>
        <Select value={loveLanguage} onValueChange={setLoveLanguage}>
          <SelectTrigger className="px-4 py-3 rounded-full border-secondary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="words">{t('onboarding.step5.words')}</SelectItem>
            <SelectItem value="quality">{t('onboarding.step5.quality')}</SelectItem>
            <SelectItem value="gifts">{t('onboarding.step5.gifts')}</SelectItem>
            <SelectItem value="acts">{t('onboarding.step5.acts')}</SelectItem>
            <SelectItem value="touch">{t('onboarding.step5.touch')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PromptField
        label={t('onboarding.step5.prompt5')}
        value={prompt5}
        onChange={setPrompt5}
        error={errors.prompt5}
      />

      <div className="space-y-2">
        <Label>{t('onboarding.step5.prompt6')}</Label>
        <Select value={relationshipType} onValueChange={setRelationshipType}>
          <SelectTrigger className="px-4 py-3 rounded-full border-secondary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="serious">{t('onboarding.step5.seriousRelationship')}</SelectItem>
            <SelectItem value="marriage">{t('onboarding.step5.marriage')}</SelectItem>
            <SelectItem value="friendship">{t('onboarding.step5.deepFriendship')}</SelectItem>
            <SelectItem value="exploring">{t('onboarding.step5.stillExploring')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PromptField
        label={t('onboarding.step5.prompt6')}
        value={prompt6}
        onChange={setPrompt6}
        error={errors.prompt6}
      />

      <Button
        onClick={handleSave}
        disabled={saving}
        size="lg"
        className="w-full rounded-full bg-primary text-white hover:bg-rose-700 font-semibold py-6"
      >
        {saving && <Loader className="animate-spin mr-2" size={20} />}
        {t('profile.save')}
      </Button>
    </div>
  )
}
