'use client'

import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { UserProfileDetail } from '@/components/user-profile-detail'
import { useAuth } from '@/context/auth-context'

interface UserProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { id } = use(params)

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-700 rounded-full animate-spin" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-playfair font-bold text-slate-900 mb-4">
              Sign In Required
            </h1>
            <p className="text-slate-600 mb-6">
              Please sign in to view user profiles
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-rose-700 text-white rounded-full font-semibold hover:bg-rose-800 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="pt-20 md:pt-24 pb-12 px-0 md:px-4">
        <div className="max-w-2xl mx-auto w-full md:rounded-2xl overflow-hidden md:overflow-visible">
          <UserProfileDetail
            userId={id}
            onBack={() => router.back()}
          />
        </div>
      </div>

      <Footer />
    </main>
  )
}
