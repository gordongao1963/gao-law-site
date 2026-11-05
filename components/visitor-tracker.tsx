'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return

    // Log visitor with detailed information
    const trackVisitor = async () => {
      try {
        // Detect device and browser info
        const ua = navigator.userAgent
        let device_type = 'desktop'
        let browser = 'unknown'
        let os = 'unknown'

        // Detect device type
        if (/mobile|android|iphone|ipad|phone/i.test(ua)) device_type = 'mobile'
        if (/tablet|ipad/i.test(ua)) device_type = 'tablet'

        // Detect browser
        if (/chrome/i.test(ua) && !/chromium|edg/i.test(ua)) browser = 'Chrome'
        else if (/safari/i.test(ua) && !/chrome|chromium/i.test(ua)) browser = 'Safari'
        else if (/firefox/i.test(ua)) browser = 'Firefox'
        else if (/edg/i.test(ua)) browser = 'Edge'
        else if (/opr|opera/i.test(ua)) browser = 'Opera'

        // Detect OS
        if (/windows/i.test(ua)) os = 'Windows'
        else if (/mac|macintosh|macos/i.test(ua)) os = 'macOS'
        else if (/linux/i.test(ua)) os = 'Linux'
        else if (/android/i.test(ua)) os = 'Android'
        else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'

        // Try to get geolocation from IP
        let geoData = {}
        try {
          const geoResponse = await fetch('https://ipapi.co/json/')
          geoData = await geoResponse.json()
        } catch {
          // Silently fail if geo API doesn't work
        }

        await fetch('/api/visitor-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: pathname,
            user_agent: ua,
            referrer: document.referrer || 'direct',
            device_type,
            browser,
            os,
            language: navigator.language,
            screen_resolution: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            ip_address: geoData.ip || 'unknown',
            country: geoData.country_name || 'unknown',
            city: geoData.city || '',
            region: geoData.region || '',
          }),
        }).catch(() => {
          // Silently fail if tracking doesn't work
        })
      } catch (error) {
        // Silently ignore tracking errors
      }
    }

    trackVisitor()
  }, [pathname])

  return null // This component doesn't render anything
}
