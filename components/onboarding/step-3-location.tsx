'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Loader } from 'lucide-react'
import { toast } from 'sonner'

interface Step3Props {
  onNext: () => void
  onSkip: () => void
  initialData?: {
    city: string
    country: string
    latitude: number
    longitude: number
  }
  onDataChange: (data: {
    city: string
    country: string
    latitude: number
    longitude: number
  }) => void
}

export function Step3Location({
  onNext,
  onSkip,
  initialData,
  onDataChange,
}: Step3Props) {
  const { t } = useLanguage()
  const [city, setCity] = useState(initialData?.city || '')
  const [country, setCountry] = useState(initialData?.country || '')
  const [latitude, setLatitude] = useState(initialData?.latitude || 0)
  const [longitude, setLongitude] = useState(initialData?.longitude || 0)
  const [detecting, setDetecting] = useState(false)
  const [useManual, setUseManual] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const detectLocation = async () => {
    setDetecting(true)
    setErrors({})

    if (!navigator.geolocation) {
      toast.error(t('onboarding.step3.locationError'))
      setUseManual(true)
      setDetecting(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords

        setLatitude(lat)
        setLongitude(lng)

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          )
          const data = await response.json()

          setCity(data.address?.city || data.address?.town || '')
          setCountry(data.address?.country || '')
          toast.success(t('onboarding.step3.locationDetected'))
        } catch (err) {
          toast.error(t('onboarding.step3.locationError'))
          setUseManual(true)
        } finally {
          setDetecting(false)
        }
      },
      () => {
        toast.error(t('onboarding.step3.locationError'))
        setUseManual(true)
        setDetecting(false)
      }
    )
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!country.trim()) {
      newErrors.country = 'Country is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onDataChange({ city, country, latitude, longitude })
      onNext()
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-playfair font-bold text-foreground">
          {t('onboarding.step3.title')}
        </h1>
        <p className="text-lg text-muted-foreground">{t('onboarding.step3.subtitle')}</p>
      </div>

      {!useManual && !city && (
        <div className="space-y-4">
          <Button
            onClick={detectLocation}
            disabled={detecting}
            className="w-full py-3 rounded-full bg-primary text-white hover:bg-rose-700 font-semibold flex items-center justify-center gap-2"
          >
            {detecting && <Loader size={20} className="animate-spin" />}
            {detecting
              ? t('onboarding.step3.detectingLocation')
              : t('onboarding.step3.enableLocation')}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            onClick={() => setUseManual(true)}
            variant="outline"
            className="w-full py-3 rounded-full border-secondary text-foreground hover:bg-muted"
          >
            {t('onboarding.step3.enterManually')}
          </Button>
        </div>
      )}

      {(useManual || city) && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              {t('onboarding.step3.city')}
            </Label>
            <Input
              id="city"
              placeholder="Barcelona"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={`px-4 py-3 rounded-full ${
                errors.city ? 'border-destructive' : 'border-secondary'
              }`}
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              {t('onboarding.step3.country')}
            </Label>
            <Input
              id="country"
              placeholder="Spain"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={`px-4 py-3 rounded-full ${
                errors.country ? 'border-destructive' : 'border-secondary'
              }`}
            />
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country}</p>
            )}
          </div>

          <Button
            onClick={() => setUseManual(false)}
            variant="ghost"
            className="w-full text-primary hover:bg-transparent underline"
          >
            {t('onboarding.step3.detectingLocation')}
          </Button>
        </div>
      )}

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
