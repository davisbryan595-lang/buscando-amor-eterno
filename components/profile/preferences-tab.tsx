'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/lib/i18n-context'
import { useProfile, ProfileData } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader, MapPin } from 'lucide-react'
import { toast } from 'sonner'

const PreferenceSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3 p-4 rounded-2xl bg-muted/50">
    <h3 className="font-semibold text-foreground">{title}</h3>
    {children}
  </div>
)

interface PreferencesTabProps {
  profile: ProfileData
  onUpdate: () => void
}

export function ProfilePreferencesTab({ profile, onUpdate }: PreferencesTabProps) {
  const { t } = useLanguage()
  const { updateProfile } = useProfile()

  const [city, setCity] = useState(profile.city || '')
  const [country, setCountry] = useState(profile.country || '')
  const [ageMin, setAgeMin] = useState(profile.age_range_min || 18)
  const [ageMax, setAgeMax] = useState(profile.age_range_max || 60)
  const [distanceRadius, setDistanceRadius] = useState(profile.distance_radius || 50)
  const [height, setHeight] = useState(profile.height_cm || 0)
  const [religion, setReligion] = useState(profile.religion || '')
  const [wantsKids, setWantsKids] = useState(profile.wants_kids || '')
  const [smoking, setSmoking] = useState(profile.smoking || '')
  const [drinking, setDrinking] = useState(profile.drinking || '')
  const [dealbreakers, setDealbreakers] = useState<string[]>(profile.dealbreakers || [])
  const [saving, setSaving] = useState(false)

  const toggleDealbreaker = (field: string) => {
    setDealbreakers((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({
        city,
        country,
        age_range_min: ageMin,
        age_range_max: ageMax,
        distance_radius: distanceRadius,
        height_cm: height,
        religion,
        wants_kids: wantsKids,
        smoking,
        drinking,
        dealbreakers,
      })
      toast.success(t('profile.saveSuccess'))
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || t('profile.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Location */}
      <PreferenceSection title="Your Location">
        <div className="space-y-4">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">Update your city and country to help matches find you</p>
          </div>
          <div>
            <Label htmlFor="city" className="text-sm font-medium text-foreground mb-1">
              City
            </Label>
            <Input
              id="city"
              placeholder="e.g., Barcelona"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-2 rounded-lg border-secondary bg-background"
            />
          </div>
          <div>
            <Label htmlFor="country" className="text-sm font-medium text-foreground mb-1">
              Country
            </Label>
            <Input
              id="country"
              placeholder="e.g., Spain"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3 py-2 rounded-lg border-secondary bg-background"
            />
          </div>
        </div>
      </PreferenceSection>

      {/* Age Range */}
      <PreferenceSection title={t('onboarding.step6.ageRange')}>
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
      <PreferenceSection title={t('onboarding.step6.distanceRadius')}>
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
      <PreferenceSection title={`${t('onboarding.step6.height')} (${t('onboarding.step6.cm')})`}>
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
      <PreferenceSection title={t('onboarding.step6.religion')}>
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
      <PreferenceSection title={t('onboarding.step6.wantsKids')}>
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
      <PreferenceSection title={t('onboarding.step6.smoking')}>
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
      <PreferenceSection title={t('onboarding.step6.drinking')}>
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
        <h3 className="font-semibold text-foreground">Mark as dealbreaker</h3>
        <div className="space-y-2">
          {[
            { field: 'wantsKids', label: t('onboarding.step6.wantsKids'), value: wantsKids },
            { field: 'smoking', label: t('onboarding.step6.smoking'), value: smoking },
            { field: 'drinking', label: t('onboarding.step6.drinking'), value: drinking },
            { field: 'religion', label: t('onboarding.step6.religion'), value: religion },
          ].map((item) => (
            <div key={item.field} className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.value}</p>
              </div>
              <Switch
                checked={dealbreakers.includes(item.field)}
                onCheckedChange={() => toggleDealbreaker(item.field)}
              />
            </div>
          ))}
        </div>
      </div>

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
