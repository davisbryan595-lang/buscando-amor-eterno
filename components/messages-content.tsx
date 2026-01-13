'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import gsap from 'gsap'
import ChatWindow from '@/components/chat-window'
import Image from 'next/image'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/context/auth-context'
import { useSubscription } from '@/hooks/useSubscription'
import { X, ArrowLeft, Menu } from 'lucide-react'

interface MessagesContentInnerProps {
  onChatOpenChange?: (isOpen: boolean) => void
  isChatOpen?: boolean
}

function MessagesContentInner({ onChatOpenChange, isChatOpen }: MessagesContentInnerProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { isPremium, loading: subLoading } = useSubscription()
  const { conversations, loading, error } = useMessages()
  const searchParams = useSearchParams()
  const userIdParam = searchParams.get('user')
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isClosingChat, setIsClosingChat] = useState(false)
  const chatWindowRef = useRef<HTMLDivElement>(null)

  // Auto-select conversation if user_id is in query params
  useEffect(() => {
    if (userIdParam && conversations.length > 0) {
      const conversation = conversations.find((c) => c.other_user_id === userIdParam)
      if (conversation) {
        setSelectedConversation(conversation)
      } else {
        setSelectedConversation({
          id: userIdParam,
          user_id: user?.id,
          other_user_id: userIdParam,
          other_user_name: null,
          other_user_image: null,
          last_message: '',
          last_message_time: new Date().toISOString(),
          is_online: false,
          unread_count: 0,
        })
      }
    }
  }, [userIdParam, conversations, user?.id])

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation)
    setSidebarOpen(false)
    onChatOpenChange?.(true)
  }

  const handleBackToConversations = () => {
    if (chatWindowRef.current) {
      setIsClosingChat(true)
      gsap.to(chatWindowRef.current, {
        x: '100%',
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          setSelectedConversation(null)
          setIsClosingChat(false)
          onChatOpenChange?.(false)
        },
      })
    } else {
      setSelectedConversation(null)
      onChatOpenChange?.(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-24 pb-12 px-4 h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-24 pb-12 px-4 h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-foreground font-semibold mb-3">Unable to load conversations</p>
          <p className="text-muted-foreground text-sm mb-6">
            {error.includes('timed out')
              ? 'The connection is taking longer than expected. Please check your internet connection and try again.'
              : error}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-rose-700 transition"
            >
              Reload Page
            </button>
            <Link
              href="/browse"
              className="px-6 py-2 bg-card-subtle text-foreground dark:bg-card-subtle dark:text-white rounded-full hover:bg-card-hover dark:hover:bg-card-hover transition"
            >
              Browse Profiles
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="pt-24 pb-12 px-4 h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view messages.</p>
      </div>
    )
  }


  return (
    <div className={`h-full w-full px-0 sm:px-4 lg:px-6 flex flex-col overflow-hidden ${selectedConversation ? 'md:mt-24' : 'mt-24'}`}>
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row gap-0 md:gap-4 lg:gap-6 overflow-hidden rounded-none md:rounded-xl">
        <div className={`w-full md:w-80 lg:w-96 bg-card dark:bg-card rounded-none md:rounded-xl border-0 md:border border-rose-100 dark:border-rose-900/40 flex-shrink-0 flex flex-col overflow-hidden ${selectedConversation ? 'hidden md:flex' : 'flex'} card-gradient`}>
          <div className="px-4 py-3 sm:p-4 lg:p-6 border-b border-rose-100 dark:border-rose-900/40 bg-card dark:bg-card flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Messages</h2>
            {selectedConversation && (
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-card-hover dark:hover:bg-card-hover rounded-full transition"
                aria-label="Close chat"
              >
                <X size={20} className="text-foreground" />
              </button>
            )}
          </div>

          <div className="divide-y dark:divide-slate-700 flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`px-3 py-3 sm:px-4 sm:py-4 lg:p-5 text-left transition border-b dark:border-slate-700 ${
                    selectedConversation?.id === conv.id ? 'bg-card-hover dark:bg-card-hover' : ''
                  }`}
                >
                  <button
                    onClick={() => handleSelectConversation(conv)}
                    className="w-full hover:opacity-80 transition flex gap-2 sm:gap-3 lg:gap-4 items-center"
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/profile/${conv.other_user_id}`)
                      }}
                      className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex-shrink-0 hover:opacity-80 transition rounded-full"
                    >
                      <Image
                        src={conv.other_user_image || '/placeholder.svg'}
                        alt={conv.other_user_name || 'User'}
                        fill
                        className="rounded-full object-cover"
                        priority
                      />
                      {conv.is_online && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white z-10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm sm:text-base lg:text-lg truncate">{conv.other_user_name || 'User'}</p>
                      <p className="text-xs sm:text-sm lg:text-base text-muted-foreground truncate">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="bg-rose-500 text-white text-xs rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center flex-shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedConversation && (
          <div ref={chatWindowRef} className={`w-full flex-1 md:flex-1 flex min-w-0 overflow-hidden ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
            <ChatWindow
              conversation={selectedConversation}
              onBack={handleBackToConversations}
            />
          </div>
        )}

        {!selectedConversation && conversations.length > 0 && (
          <div className="flex-1 hidden md:flex items-center justify-center bg-card dark:bg-card rounded-xl border border-rose-100 dark:border-rose-900/40">
            <div className="text-center text-muted-foreground">
              <p className="text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface MessagesContentProps {
  onChatOpenChange?: (isOpen: boolean) => void
  isChatOpen?: boolean
}

export function MessagesContent({ onChatOpenChange, isChatOpen }: MessagesContentProps) {
  return (
    <Suspense fallback={<div className="pt-24 pb-12 px-4 h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
      <MessagesContentInner onChatOpenChange={onChatOpenChange} isChatOpen={isChatOpen} />
    </Suspense>
  )
}
