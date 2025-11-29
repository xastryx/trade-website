'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page view on route change
    const trackPageView = async () => {
      try {
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'page_view',
            meta: {
              page: pathname,
              referrer: document.referrer || undefined,
              timestamp: new Date().toISOString(),
            }
          }),
        })
      } catch (error) {
        // Silently fail - page view tracking shouldn't break the app
      }
    }

    trackPageView()
  }, [pathname])

  return null // This component doesn't render anything
}
