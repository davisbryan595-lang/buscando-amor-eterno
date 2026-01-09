'use client';
import { useEffect } from 'react';

export function ReconnectHandler() {
  useEffect(() => {
    // Track visibility state for debugging
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('[ReconnectHandler] Tab hidden - Supabase will pause subscriptions');
      } else {
        console.log('[ReconnectHandler] Tab visible - Supabase will auto-reconnect subscriptions');
        // Supabase Realtime client automatically handles reconnection when page becomes visible
        // No manual reload needed - it would abort in-flight network requests during navigation
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return null;
}
