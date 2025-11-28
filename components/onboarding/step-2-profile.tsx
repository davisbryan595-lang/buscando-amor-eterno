'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, User, Heart } from 'lucide-react'
import { format } from 'date-fns'

interface Step2Props {
  onNext: () => void
  onSkip: () => void
  initialData?: {
    fullName: string
    birthday: string
    gender: string
    lookingFor: string
  }
  onDataChange: (data: {
    fullName: string
    birthday: string
    gender: string
    lookingFor: string
  }) => void
}

export function Step2Profile({
  onNext,
  onSkip,
  initialData,
  onDataChange,
}: Step2Props) {
  const { t } = useLanguage()
  const [fullName, setFullName] = useState(initialData?.fullName || '')
  const [birthday, setBirthday] = useState(initialData?.birthday || '')
  const [gender, setGender] = useState(initialData?.gender || '')
  const [lookingFor, setLookingFor] = useState(initialData?.lookingFor || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!birthday) {
      newErrors.birthday = 'Birthday is required'
    } else {
      const birthDate = new Date(birthday)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        if (age - 1 < 18) {
          newErrors.birthday = t('onboarding.step2.mustBe18')
        }
      } else if (age < 18) {
        newErrors.birthday = t('onboarding.step2.mustBe18')
      }
    }

    if (!gender) {
      newErrors.gender = 'Gender is required'
    }

    if (!lookingFor) {
      newErrors.lookingFor = 'Looking for is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onDataChange({ fullName, birthday, gender, lookingFor })
      onNext()
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-playfair font-bold text-foreground">
          {t('onboarding.step2.title')}
        </h1>
        <p className="text-lg text-muted-foreground">{t('onboarding.step2.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2">
            <User size={18} className="text-primary" />
            {t('onboarding.step2.fullName')}
          </Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`px-4 py-3 rounded-full ${
              errors.fullName ? 'border-destructive' : 'border-secondary'
            }`}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthday" className="flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            {t('onboarding.step2.birthday')}
          </Label>
          <Input
            id="birthday"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')}
            className={`px-4 py-3 rounded-full ${
              errors.birthday ? 'border-destructive' : 'border-secondary'
            }`}
          />
          {errors.birthday && (
            <p className="text-sm text-destructive">{errors.birthday}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="flex items-center gap-2">
            <Heart size={18} className="text-primary" />
            {t('onboarding.step2.gender')}
          </Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="px-4 py-3 rounded-full border-secondary">
              <SelectValue placeholder={t('onboarding.step2.selectGender')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="woman">{t('onboarding.step2.woman')}</SelectItem>
              <SelectItem value="man">{t('onboarding.step2.man')}</SelectItem>
              <SelectItem value="nonbinary">{t('onboarding.step2.nonBinary')}</SelectItem>
              <SelectItem value="other">{t('onboarding.step2.other')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-destructive">{errors.gender}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lookingFor" className="flex items-center gap-2">
            <Heart size={18} className="text-primary" />
            {t('onboarding.step2.lookingFor')}
          </Label>
          <Select value={lookingFor} onValueChange={setLookingFor}>
            <SelectTrigger className="px-4 py-3 rounded-full border-secondary">
              <SelectValue placeholder={t('onboarding.step2.selectLookingFor')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="women">{t('onboarding.step2.women')}</SelectItem>
              <SelectItem value="men">{t('onboarding.step2.men')}</SelectItem>
              <SelectItem value="everyone">{t('onboarding.step2.everyone')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.lookingFor && (
            <p className="text-sm text-destructive">{errors.lookingFor}</p>
          )}
        </div>
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
