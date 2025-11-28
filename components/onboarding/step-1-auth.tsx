'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { useLanguage } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Mail, Lock, Chrome, Apple } from 'lucide-react'
import { toast } from 'sonner'

interface Step1Props {
  onNext: () => void
}

export function Step1Auth({ onNext }: Step1Props) {
  const { signUp, signInWithOAuth } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('onboarding.step1.invalidEmail')
    }

    if (!password || password.length < 8) {
      newErrors.password = t('onboarding.step1.passwordTooShort')
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      await signUp(email, password)
      toast.success('Account created! Check your email to confirm.')
      onNext()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignUp = async (provider: 'google' | 'apple') => {
    setLoading(true)
    try {
      await signInWithOAuth(provider)
    } catch (error: any) {
      toast.error(error.message || `Failed to sign up with ${provider}`)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-playfair font-bold text-foreground">{t('onboarding.step1.title')}</h1>
        <p className="text-lg text-muted-foreground">{t('onboarding.step1.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail size={18} className="text-primary" />
            {t('onboarding.step1.email')}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={t('onboarding.step1.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`px-4 py-3 rounded-full ${
              errors.email ? 'border-destructive' : 'border-secondary'
            }`}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            {t('onboarding.step1.password')}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder={t('onboarding.step1.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`px-4 py-3 rounded-full ${
              errors.password ? 'border-destructive' : 'border-secondary'
            }`}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`px-4 py-3 rounded-full ${
              errors.confirmPassword ? 'border-destructive' : 'border-secondary'
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
            {t('onboarding.step1.agreeToTerms')}
          </Label>
        </div>
        {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-full font-semibold text-lg hover:bg-rose-700 transition disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">Or</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            onClick={() => handleOAuthSignUp('google')}
            disabled={loading}
            variant="outline"
            className="py-3 rounded-full flex items-center justify-center gap-2 border-secondary"
          >
            <Chrome size={20} />
            <span className="hidden sm:inline">Google</span>
          </Button>
          <Button
            type="button"
            onClick={() => handleOAuthSignUp('apple')}
            disabled={loading}
            variant="outline"
            className="py-3 rounded-full flex items-center justify-center gap-2 border-secondary"
          >
            <Apple size={20} />
            <span className="hidden sm:inline">Apple</span>
          </Button>
        </div>
      </div>

      <p className="text-center text-muted-foreground">
        {t('onboarding.step1.alreadyHaveAccount')}{' '}
        <a href="/login" className="text-primary font-semibold hover:underline">
          {t('onboarding.step1.logIn')}
        </a>
      </p>
    </div>
  )
}
