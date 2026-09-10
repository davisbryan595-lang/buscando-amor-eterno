'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'

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
  description = 'All features are currently available at no cost.',
}: PaywallModalProps) {
  const router = useRouter()
  const { user } = useAuth()

  const handleContinue = () => {
    router.push(user ? '/browse' : '/signup')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">{featureName} is free</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Not Now
          </Button>
          <Button onClick={handleContinue} className="flex-1">
            {user ? 'Browse Profiles' : 'Join Free'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
