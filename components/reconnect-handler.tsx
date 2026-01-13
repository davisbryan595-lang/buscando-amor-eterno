'use client';
import { useEffect } from 'react';

export function ReconnectHandler() {
  useEffect(() => {
    let wasHidden = false;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true;
      } else if (wasHidden && document.visibilityState === 'visible') {
        // Tab became visible after being hidden - reload to refresh state
        console.log('[ReconnectHandler] Tab activated after idle period, reloading app');
        window.location.reload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return null;
}
