"use client"

import { useEffect } from "react"

type AdBannerProps = {
  dataAdSlot: string
  dataAdFormat?: string
  dataFullWidthResponsive?: boolean
  className?: string
}

export function AdBanner({
  dataAdSlot,
  dataAdFormat = "auto",
  dataFullWidthResponsive = true,
  className = "",
}: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error("AdSense error:", err)
    }
  }, [])

  if (process.env.NODE_ENV !== "production") {
    return (
      <div className={`flex items-center justify-center bg-gray-200 border border-gray-300 text-gray-500 text-sm p-4 rounded-md ${className}`} style={{ minHeight: "100px" }}>
        Ad Placeholder (Visible in Dev)
      </div>
    )
  }

  return (
    <div className={`ad-container overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  )
}
