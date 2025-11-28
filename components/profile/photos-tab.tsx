'use client'

import React, { useState, useRef } from 'react'
import { useLanguage } from '@/lib/i18n-context'
import { useProfile, ProfileData } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Loader, Plus, X, Star } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface PhotosTabProps {
  profile: ProfileData
  onUpdate: () => void
}

export function ProfilePhotosTab({ profile, onUpdate }: PhotosTabProps) {
  const { t } = useLanguage()
  const { uploadPhoto, deletePhoto, setMainPhoto } = useProfile()
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const photos = profile.photos || []
  const mainPhotoIndex = profile.main_photo_index || 0

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    if (photos.length >= 6) {
      toast.error('Maximum 6 photos allowed')
      return
    }

    setUploading(true)
    try {
      const file = files[0]
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }

      await uploadPhoto(file, photos.length)
      toast.success('Photo uploaded successfully')
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (photoToDelete === null) return

    setDeleting(photoToDelete)
    try {
      await deletePhoto(photoToDelete)
      toast.success('Photo deleted')
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete photo')
    } finally {
      setDeleting(null)
      setPhotoToDelete(null)
    }
  }

  const handleSetMainPhoto = async (index: number) => {
    try {
      await setMainPhoto(index)
      toast.success('Main photo updated')
      onUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update main photo')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group"
          >
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {mainPhotoIndex === index && (
              <div className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star size={12} fill="currentColor" />
                Main
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
              {mainPhotoIndex !== index && (
                <Button
                  onClick={() => handleSetMainPhoto(index)}
                  size="sm"
                  variant="secondary"
                  className="rounded-full"
                >
                  <Star size={16} />
                </Button>
              )}
              <Button
                onClick={() => setPhotoToDelete(index)}
                size="sm"
                variant="destructive"
                className="rounded-full"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        ))}

        {photos.length < 6 && (
          <label className="aspect-square rounded-2xl border-2 border-dashed border-secondary flex items-center justify-center cursor-pointer hover:border-primary transition bg-muted/50">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
            />
            <Plus size={32} className="text-muted-foreground" />
          </label>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= 6}
          className="flex-1 rounded-full gap-2"
        >
          {uploading && <Loader className="animate-spin" size={20} />}
          Upload
        </Button>
        <Button
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading || photos.length >= 6}
          variant="outline"
          className="flex-1 rounded-full border-secondary gap-2"
        >
          Camera
        </Button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={photoToDelete !== null} onOpenChange={() => setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
          <AlertDialogDescription>
            {t('profile.deleteConfirm')}
          </AlertDialogDescription>
          <div className="flex gap-4">
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting !== null}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting !== null && <Loader className="animate-spin mr-2" size={16} />}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
