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
  description = 'Audio and video calls are Premium features at $12/month. Online checkout is not available yet; contact support to request access.',
}: PaywallModalProps) {
  const router = useRouter()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Premium required for {featureName}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Not Now
          </Button>
          <Button onClick={() => { router.push('/contact'); onClose() }} className="flex-1">
            Contact Support
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
