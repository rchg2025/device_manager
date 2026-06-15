"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

export default function FilterBar({ categories }: { categories: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [name, setName] = useState(searchParams.get("name") || "")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const debouncedName = useDebounce(name, 500)

  // Flag to avoid initial render fetching if nothing changed
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)
      return
    }
    const params = new URLSearchParams()
    if (debouncedName) params.set("name", debouncedName)
    if (category) params.set("category", category)
    router.push(`/dashboard/equipments?${params.toString()}`)
  }, [debouncedName, category, router])

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tìm thiết bị theo tên hoặc mã vạch..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="sm:w-48">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="block w-full border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
