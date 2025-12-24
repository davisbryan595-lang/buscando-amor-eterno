'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Camera, Loader } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Step4Props {
  onNext: () => void
  onSkip: () => void
  initialPhotos?: File[]
  onDataChange: (files: File[]) => void
  onUploadComplete?: (urls: string[]) => void
}

export function Step4Photos({
  onNext,
  onSkip,
  initialPhotos = [],
  onDataChange,
  onUploadComplete,
}: Step4Props) {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>(initialPhotos)
  const [previews, setPreviews] = useState<string[]>(
    initialPhotos.map((f) => URL.createObjectURL(f))
  )
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const previewUrlsRef = useRef<string[]>(
    initialPhotos.map((f) => URL.createObjectURL(f))
  )

  React.useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      if (files.length + newFiles.length > 6) {
        toast.error('Maximum 6 photos allowed')
        return
      }

      const validFiles = newFiles.filter((file) => {
        if (!file.type.startsWith('image/')) {
          toast.error('Only image files are allowed')
          return false
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image must be less than 5MB')
          return false
        }
        return true
      })

      const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
      previewUrlsRef.current.push(...newPreviews)
      setFiles([...files, ...validFiles])
      setPreviews([...previews, ...newPreviews])
      onDataChange([...files, ...validFiles])
    },
    [files, previews, onDataChange]
  )

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFiles(Array.from(e.dataTransfer.files))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const removePhoto = (index: number) => {
    const removedUrl = previews[index]
    if (removedUrl) {
      URL.revokeObjectURL(removedUrl)
      previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== removedUrl)
    }
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setFiles(newFiles)
    setPreviews(newPreviews)
    onDataChange(newFiles)
  }

  const handleNext = () => {
    if (files.length === 0) {
      toast.error(t('onboarding.step4.photoRequired'))
      return
    }
    onNext()
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-playfair font-bold text-foreground">
          {t('onboarding.step4.title')}
        </h1>
        <p className="text-lg text-muted-foreground">{t('onboarding.step4.subtitle')}</p>
      </div>

      {/* Photo Grid */}
      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={preview} className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group">
                <img
                  src={preview}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Main
                  </div>
                )}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-destructive text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {previews.length < 6 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-secondary flex items-center justify-center cursor-pointer hover:border-primary transition bg-muted/50">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-semibold text-foreground">Add photo</p>
                </div>
              </label>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {previews.length} of 6 photos
          </p>
        </div>
      )}

      {previews.length === 0 && (
        <div className="space-y-4">
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="block border-2 border-dashed border-secondary rounded-3xl p-8 text-center cursor-pointer hover:border-primary transition bg-muted/50"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(Array.from(e.target.files || []))}
              className="hidden"
            />
            <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              {t('onboarding.step4.dragDropPhotos')}
            </p>
            <p className="text-sm text-muted-foreground">{t('onboarding.step4.clickToUpload')}</p>
          </label>

          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 rounded-full bg-primary text-white hover:bg-rose-700 font-semibold flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              <span className="hidden sm:inline">Upload Photos</span>
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 py-3 rounded-full border-2 border-primary text-primary hover:bg-primary/10 font-semibold flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              <span className="hidden sm:inline">Camera</span>
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFiles(Array.from(e.target.files || []))}
              className="hidden"
            />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {t('onboarding.step4.maxPhotos')}
          </p>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{t('onboarding.step4.uploadingPhotos')}</p>
            <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2 rounded-full" />
        </div>
      )}

      <div className="flex gap-4">
        <Button
          onClick={handleNext}
          disabled={uploading}
          className="w-full py-3 rounded-full bg-primary text-white hover:bg-rose-700 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading && <Loader size={20} className="animate-spin" />}
          {t('onboarding.nextStep')}
        </Button>
      </div>
    </div>
  )
}
