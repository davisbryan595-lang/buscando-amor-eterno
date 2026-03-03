'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Zap } from 'lucide-react'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
  description?: string
}

export function PaywallModal({
  isOpen,
  onClose,
  featureName,
  description = 'Upgrade to premium to unlock this feature.',
}: PaywallModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = () => {
    if (!user) {
      // Redirect to signup if not logged in
      router.push('/signup')
      return
    }

    // Redirect to pricing page where they can learn more and proceed to checkout
    router.push('/pricing')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Unlock {featureName}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 border border-rose-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              Premium Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                Browse unlimited profiles
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                Send and receive messages
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                Video dates with matches
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2"></span>
                Join the exclusive lounge
              </li>
            </ul>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">Only $12/month</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Not Now
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
          >
            {loading ? 'Processing...' : 'Upgrade Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
