"use client"

import { useEffect, useState, useRef } from "react"

interface Trade {
  id: string
  discord_id: string
  game: string
  offering: string[]
  requesting: string[]
  notes: string
  created_at: string
  status: string
}

export function useTradesRealtime(userId?: string) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchingRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const fetchTrades = async () => {
      if (fetchingRef.current) return
      fetchingRef.current = true

      try {
        if (loading) setLoading(true)
        setError(null)

        const url = userId ? `/api/trades?userId=${userId}` : "/api/trades"
        const response = await fetch(url)

        if (!response.ok) throw new Error("Failed to fetch trades")

        const data = await response.json()
        setTrades(data.trades || [])
      } catch (err) {
        console.error("Error fetching trades:", err)
        setError(err instanceof Error ? err.message : "Failed to load trades")
      } finally {
        setLoading(false)
        fetchingRef.current = false
      }
    }

    // Initial fetch
    fetchTrades()

    // Poll every 5 seconds for updates
    intervalRef.current = setInterval(fetchTrades, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      fetchingRef.current = false
    }
  }, [userId])

  return { trades, loading, error }
}
