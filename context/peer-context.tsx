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

export function PeerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const peerRef = useRef<Peer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const initializingRef = useRef(false)
  const destroyingRef = useRef(false)

  useEffect(() => {
    if (!user || initializingRef.current) return

    const initPeer = async () => {
      initializingRef.current = true
      try {
        // Check if peer is already initialized and valid
        if (peerRef.current && !peerRef.current.destroyed) {
          setIsReady(true)
          setError(null)
          initializingRef.current = false
          return
        }

        // Destroy any existing peer before creating a new one
        if (peerRef.current && peerRef.current.destroyed === false) {
          try {
            peerRef.current.destroy()
          } catch (err) {
            console.warn('[PeerContext] Error destroying previous peer:', err)
          }
        }

        const peer = new Peer(user.id, {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
          ],
          config: {
            iceTransportPolicy: 'all',
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
          },
          debug: process.env.NODE_ENV === 'development' ? 2 : 0,
          ping: 30000,
        })

        peer.on('open', () => {
          console.log('[PeerContext] Peer connection established with ID:', user.id)
          setError(null)
          setIsReady(true)
          initializingRef.current = false
        })

        peer.on('error', (err: any) => {
          console.error('[PeerContext] Peer error:', err.type, err.message)
          
          // Handle ID taken error with retry
          if (err.type === 'unavailable-id') {
            const errorMsg = `Connection error: ID "${user.id}" is taken. Please try again.`
            setError(errorMsg)
            // Attempt to reconnect after a delay
            setTimeout(() => {
              if (!destroyingRef.current && peerRef.current && !peerRef.current.destroyed) {
                console.log('[PeerContext] Attempting to reconnect...')
                peerRef.current.reconnect()
              }
            }, 2000)
          } else if (err.type !== 'peer-unavailable' && err.type !== 'network') {
            setError(`Connection error: ${err.message}`)
          }
        })

        peer.on('disconnected', () => {
          console.log('[PeerContext] Peer disconnected - attempting reconnect')
          if (!destroyingRef.current) {
            setTimeout(() => {
              if (peerRef.current && peerRef.current.disconnected && !peerRef.current.destroyed) {
                console.log('[PeerContext] Reconnecting...')
                peerRef.current.reconnect()
              }
            }, 1000)
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
    }

    initPeer()

    return () => {
      // Don't destroy on user change, only on unmount
      // The peer will be reused if the same user is still logged in
    }
  }, [user])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyingRef.current = true
      if (peerRef.current && !peerRef.current.destroyed) {
        try {
          console.log('[PeerContext] Destroying peer connection')
          peerRef.current.destroy()
        } catch (err) {
          console.warn('[PeerContext] Error destroying peer:', err)
        }
      }
    }
  }, [])

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
