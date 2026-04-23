"use client"

import { useState, useEffect } from "react"

export default function AutoRefreshBadge({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications/count")
        if (res.ok) {
          const data = await res.json()
          setCount(data.count)
        }
      } catch (error) {
        // ignore errors
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [])

  if (count === 0) return null

  return (
    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
      {count}
    </span>
  )
}
