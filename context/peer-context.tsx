'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import Peer from 'peerjs'
import { useAuth } from '@/context/auth-context'

interface PeerContextType {
  peer: Peer | null
  error: string | null
  isReady: boolean
}

const PeerContext = createContext<PeerContextType | undefined>(undefined)

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function PeerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const peerRef = useRef<Peer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const initializingRef = useRef(false)
  const destroyingRef = useRef(false)
  const sessionIdRef = useRef<string>(generateSessionId())
  const retryCountRef = useRef(0)
  const maxRetriesRef = useRef(5)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const sanitizePeerId = useCallback((id: string): string => {
    // Remove hyphens and any non-alphanumeric characters (except underscore)
    // PeerJS only accepts alphanumeric characters
    return id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 64)
  }, [])

  const destroyPeer = useCallback(() => {
    if (peerRef.current && !peerRef.current.destroyed) {
      try {
        peerRef.current.destroy()
        console.log('[PeerContext] Peer destroyed successfully')
      } catch (err) {
        console.warn('[PeerContext] Error destroying peer:', err)
      }
      peerRef.current = null
    }
  }, [])

  const initPeer = useCallback(async () => {
    if (initializingRef.current) return

    initializingRef.current = true
    try {
      // Check if peer is already initialized and valid
      if (peerRef.current && !peerRef.current.destroyed && peerRef.current.open) {
        setIsReady(true)
        setError(null)
        initializingRef.current = false
        return
      }

      // Destroy any existing peer before creating a new one
      destroyPeer()

      // Use user ID with session suffix to support multiple tabs
      // Sanitize to ensure PeerJS compatibility (alphanumeric only, max 64 chars)
      const peerId = sanitizePeerId(`${user.id}${sessionIdRef.current}`)
      console.log('[PeerContext] Initializing peer with ID:', peerId)

      const peerServerUrl = process.env.NEXT_PUBLIC_PEER_SERVER_URL || 'peer-server-buscando.vercel.app'
      const peerServerPort = process.env.NEXT_PUBLIC_PEER_SERVER_PORT || 443

      const peer = new Peer(peerId, {
        host: peerServerUrl,
        port: peerServerPort,
        path: '/peerjs',
        secure: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
          ],
          iceTransportPolicy: 'all',
          bundlePolicy: 'max-bundle',
          rtcpMuxPolicy: 'require',
          sdpSemantics: 'unified-plan',
        },
        debug: process.env.NODE_ENV === 'development' ? 2 : 0,
      })

      peer.on('open', () => {
        console.log('[PeerContext] Peer connection established with ID:', peerId)
        setError(null)
        setIsReady(true)
        retryCountRef.current = 0
        initializingRef.current = false
      })

      peer.on('error', (err: any) => {
        const errorType = err?.type || 'UNKNOWN'
        const errorMessage = err?.message || 'Unknown error'
        console.error('[PeerContext] Peer error:', { type: errorType, message: errorMessage, fullError: err })

        // Handle ID taken error with exponential backoff retry
        if (errorType === 'unavailable-id') {
          setIsReady(false)
          if (retryCountRef.current < maxRetriesRef.current) {
            retryCountRef.current++
            const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 30000)
            console.log(`[PeerContext] Peer ID taken, retrying in ${delay}ms (attempt ${retryCountRef.current}/${maxRetriesRef.current})`)

            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current)
            }

            retryTimeoutRef.current = setTimeout(() => {
              if (!destroyingRef.current) {
                initPeer()
              }
            }, delay)
          } else {
            const errorMsg = `Connection error: Unable to establish peer connection after ${maxRetriesRef.current} attempts. Please refresh the page.`
            setError(errorMsg)
            initializingRef.current = false
          }
        } else if (errorType === 'server-error' || errorType === 'socket-error' || errorType === 'webrtc' || errorType === 'browser-incompatible') {
          // Server/connectivity errors - retry with exponential backoff
          setIsReady(false)
          if (retryCountRef.current < maxRetriesRef.current) {
            retryCountRef.current++
            const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 30000)
            console.log(`[PeerContext] Connection error (${errorType}), retrying in ${delay}ms (attempt ${retryCountRef.current}/${maxRetriesRef.current})`)

            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current)
            }

            retryTimeoutRef.current = setTimeout(() => {
              if (!destroyingRef.current) {
                initPeer()
              }
            }, delay)
          } else {
            const errorMsg = `Connection failed: ${errorMessage}. Please check your internet and refresh.`
            setError(errorMsg)
            initializingRef.current = false
          }
        } else if (errorType !== 'peer-unavailable' && errorType !== 'network') {
          setError(`Connection error: ${errorMessage}`)
          initializingRef.current = false
        }
      })

      peer.on('disconnected', () => {
        console.log('[PeerContext] Peer disconnected - attempting reconnect')
        setIsReady(false)
        if (!destroyingRef.current) {
          // Try to reconnect first
          try {
            peer.reconnect()
            console.log('[PeerContext] Reconnect attempted')
          } catch (err) {
            console.warn('[PeerContext] Reconnect failed, will reinitialize:', err)
            // If reconnect fails, fully reinitialize after delay with exponential backoff
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current)
            }
            const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000)
            retryTimeoutRef.current = setTimeout(() => {
              if (!destroyingRef.current) {
                retryCountRef.current++
                initPeer()
              }
            }, delay)
          }
        }
      })

      peerRef.current = peer
    } catch (err: any) {
      const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to initialize peer connection')
      console.error('[PeerContext] Peer initialization error:', errorMessage, err)
      setError(errorMessage)
      setIsReady(false)
      initializingRef.current = false
    }
  }, [user, destroyPeer, sanitizePeerId])

  useEffect(() => {
    if (!user) {
      setIsReady(false)
      setError(null)
      destroyPeer()
      return
    }

    retryCountRef.current = 0
    initPeer()

    return () => {
      // Don't destroy on user change, only on unmount
      // The peer will be reused if the same user is still logged in
    }
  }, [user, initPeer, destroyPeer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyingRef.current = true
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      destroyPeer()
    }
  }, [destroyPeer])

  return (
    <PeerContext.Provider value={{ peer: peerRef.current, error, isReady }}>
      {children}
    </PeerContext.Provider>
  )
}

export function usePeer() {
  const context = useContext(PeerContext)
  if (!context) {
    throw new Error('usePeer must be used within a PeerProvider')
  }
  return context
}
