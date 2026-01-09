'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Heart, Flame } from 'lucide-react'

const PreferenceSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) => (
  <div className="space-y-3 p-4 rounded-2xl bg-muted/50">
    <div className="flex items-center gap-2">
      <div className="text-primary">{Icon}</div>
      <h3 className="font-semibold text-foreground">{title}</h3>
    </div>
    {children}
  </div>
)

interface DealBreakerOptionProps {
  field: string
  label: string
  value: string
  checked: boolean
  onToggle: (field: string) => void
}

const DealBreakerOption = ({ field, label, value, checked, onToggle }: DealBreakerOptionProps) => (
  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
    <div className="flex-1">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={() => onToggle(field)}
      />
    </div>
  </div>
)

interface Step6Props {
  onNext: () => void
  onSkip: () => void
  initialData?: {
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
  onDataChange: (data: {
    ageMin: number
    ageMax: number
    distanceRadius: number
    height: number
    religion: string
    wantsKids: string
    smoking: string
    drinking: string
    dealbreakers: string[]
  }) => void
}

export function Step6Preferences({
  onNext,
  onSkip,
  initialData,
  onDataChange,
}: Step6Props) {
  const { t } = useLanguage()
  const [ageMin, setAgeMin] = useState(initialData?.ageMin || 18)
  const [ageMax, setAgeMax] = useState(initialData?.ageMax || 60)
  const [distanceRadius, setDistanceRadius] = useState(initialData?.distanceRadius || 50)
  const [height, setHeight] = useState(initialData?.height || 0)
  const [religion, setReligion] = useState(initialData?.religion || '')
  const [wantsKids, setWantsKids] = useState(initialData?.wantsKids || '')
  const [smoking, setSmoking] = useState(initialData?.smoking || '')
  const [drinking, setDrinking] = useState(initialData?.drinking || '')
  const [dealbreakers, setDealbreakers] = useState<string[]>(
    initialData?.dealbreakers || []
  )
  const [showSkipWarning, setShowSkipWarning] = useState(false)

  const toggleDealbreaker = (field: string) => {
    setDealbreakers((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    )
  }

  const handleNext = () => {
    onDataChange({
      ageMin,
      ageMax,
      distanceRadius,
      height,
      religion,
      wantsKids,
      smoking,
      drinking,
      dealbreakers,
    })
    onNext()
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-playfair font-bold text-foreground">
          {t('onboarding.step6.title')}
        </h1>
        <p className="text-lg text-muted-foreground">{t('onboarding.step6.subtitle')}</p>
      </div>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
        {/* Age Range */}
        <PreferenceSection
          title={t('onboarding.step6.ageRange')}
          icon={<Heart size={20} />}
        >
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{ageMin} years</span>
              <span className="text-muted-foreground">{ageMax} years</span>
            </div>
            <Slider
              defaultValue={[ageMin, ageMax]}
              min={18}
              max={100}
              step={1}
              onValueChange={(value) => {
                setAgeMin(value[0])
                setAgeMax(value[1])
              }}
              className="py-4"
            />
          </div>
        </PreferenceSection>

        {/* Distance */}
        <PreferenceSection
          title={t('onboarding.step6.distanceRadius')}
          icon={<Flame size={20} />}
        >
          <div className="space-y-4">
            <div className="text-center text-2xl font-bold text-primary">
              {distanceRadius} {t('onboarding.step6.km')}
            </div>
            <Slider
              defaultValue={[distanceRadius]}
              min={5}
              max={200}
              step={5}
              onValueChange={(value) => setDistanceRadius(value[0])}
              className="py-4"
            />
          </div>
        </PreferenceSection>

        {/* Height */}
        <PreferenceSection
          title={`${t('onboarding.step6.height')} (${t('onboarding.step6.cm')})`}
          icon={<Heart size={20} />}
        >
          <div className="space-y-4">
            {height > 0 && (
              <div className="text-center text-2xl font-bold text-primary">{height} cm</div>
            )}
            <Slider
              defaultValue={[height]}
              min={0}
              max={220}
              step={1}
              onValueChange={(value) => setHeight(value[0])}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground text-center">
              Leave at 0 if no preference
            </p>
          </div>
        </PreferenceSection>

        {/* Religion */}
        <PreferenceSection
          title={t('onboarding.step6.religion')}
          icon={<Heart size={20} />}
        >
          <Select value={religion} onValueChange={setReligion}>
            <SelectTrigger className="px-3 py-2 rounded-lg border-secondary bg-background">
              <SelectValue placeholder="Select religion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="catholic">{t('onboarding.step6.catholic')}</SelectItem>
              <SelectItem value="evangelical">{t('onboarding.step6.evangelical')}</SelectItem>
              <SelectItem value="atheist">{t('onboarding.step6.atheist')}</SelectItem>
              <SelectItem value="agnostic">{t('onboarding.step6.agnostic')}</SelectItem>
              <SelectItem value="other">{t('onboarding.step6.noImportant')}</SelectItem>
            </SelectContent>
          </Select>
        </PreferenceSection>

        {/* Wants Kids */}
        <PreferenceSection
          title={t('onboarding.step6.wantsKids')}
          icon={<Heart size={20} />}
        >
          <Select value={wantsKids} onValueChange={setWantsKids}>
            <SelectTrigger className="px-3 py-2 rounded-lg border-secondary bg-background">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">{t('onboarding.step6.yes')}</SelectItem>
              <SelectItem value="no">{t('onboarding.step6.no')}</SelectItem>
              <SelectItem value="someday">{t('onboarding.step6.someday')}</SelectItem>
              <SelectItem value="unsure">{t('onboarding.step6.notSure')}</SelectItem>
            </SelectContent>
          </Select>
        </PreferenceSection>

        {/* Smoking */}
        <PreferenceSection
          title={t('onboarding.step6.smoking')}
          icon={<Flame size={20} />}
        >
          <Select value={smoking} onValueChange={setSmoking}>
            <SelectTrigger className="px-3 py-2 rounded-lg border-secondary bg-background">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">{t('onboarding.step6.yes')}</SelectItem>
              <SelectItem value="no">{t('onboarding.step6.no')}</SelectItem>
              <SelectItem value="occasionally">{t('onboarding.step6.occasionally')}</SelectItem>
            </SelectContent>
          </Select>
        </PreferenceSection>

        {/* Drinking */}
        <PreferenceSection
          title={t('onboarding.step6.drinking')}
          icon={<Flame size={20} />}
        >
          <Select value={drinking} onValueChange={setDrinking}>
            <SelectTrigger className="px-3 py-2 rounded-lg border-secondary bg-background">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">{t('onboarding.step6.never')}</SelectItem>
              <SelectItem value="socially">{t('onboarding.step6.socially')}</SelectItem>
              <SelectItem value="frequently">{t('onboarding.step6.frequently')}</SelectItem>
            </SelectContent>
          </Select>
        </PreferenceSection>

        {/* Dealbreakers */}
        <div className="space-y-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/20">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-destructive" />
            <h3 className="font-semibold text-foreground">Mark as dealbreaker</h3>
          </div>
          <div className="space-y-2">
            <DealBreakerOption
              field="wantsKids"
              label={t('onboarding.step6.wantsKids')}
              value={wantsKids}
              checked={dealbreakers.includes('wantsKids')}
              onToggle={toggleDealbreaker}
            />
            <DealBreakerOption
              field="smoking"
              label={t('onboarding.step6.smoking')}
              value={smoking}
              checked={dealbreakers.includes('smoking')}
              onToggle={toggleDealbreaker}
            />
            <DealBreakerOption
              field="drinking"
              label={t('onboarding.step6.drinking')}
              value={drinking}
              checked={dealbreakers.includes('drinking')}
              onToggle={toggleDealbreaker}
            />
            <DealBreakerOption
              field="religion"
              label={t('onboarding.step6.religion')}
              value={religion}
              checked={dealbreakers.includes('religion')}
              onToggle={toggleDealbreaker}
            />
          </div>
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
          {t('onboarding.complete')}
        </Button>
      </div>
    </div>
  )
}
