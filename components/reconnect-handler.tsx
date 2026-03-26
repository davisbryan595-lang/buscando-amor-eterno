'use client';
import { useEffect } from 'react';

export function ReconnectHandler() {
  useEffect(() => {
    let wasHidden = false;
    let reloadTimeout: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true;
      } else if (wasHidden && document.visibilityState === 'visible') {
        // Tab became visible after being hidden
        // Use a debounced reload with a delay to allow subscriptions to reconnect naturally
        console.log('[ReconnectHandler] Tab activated, preparing to reconnect subscriptions');

        // Clear any previous reload attempt
        if (reloadTimeout) {
          clearTimeout(reloadTimeout);
        }

        // Wait 3 seconds for subscriptions to attempt natural reconnection
        // Then reload if needed to ensure fresh state
        reloadTimeout = setTimeout(() => {
          console.log('[ReconnectHandler] Performing app reload to refresh state');
          window.location.reload();
        }, 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (reloadTimeout) {
        clearTimeout(reloadTimeout);
      }
    };
  }, []);

  return null;
}
