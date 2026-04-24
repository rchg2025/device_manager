"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter } from "lucide-react"

export default function FilterBar({ areas, rooms, categories }: { areas: any[], rooms: any[], categories: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get("query") || "")
  const [areaFilter, setAreaFilter] = useState(searchParams.get("area") || "")
  const [roomFilter, setRoomFilter] = useState(searchParams.get("room") || "")
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "")

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query) params.set("query", query)
      else params.delete("query")
      
      params.delete("page") // Reset to page 1 on new search
      router.push(`/dashboard/classroom-equipments?${params.toString()}`)
    }, 500)

    return () => clearTimeout(timer)
  }, [query, router, searchParams])

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    
    if (key === 'area') {
      params.delete('room') // Reset room when area changes
    }
    
    params.delete("page")
    router.push(`/dashboard/classroom-equipments?${params.toString()}`)
  }

  // Filter rooms based on selected area
  const availableRooms = areaFilter 
    ? rooms.filter(r => r.areaId === areaFilter)
    : rooms

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm thiết bị phòng học..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
          <Filter className="w-4 h-4" /> Lọc:
        </div>
        
        <select
          value={areaFilter}
          onChange={(e) => {
            setAreaFilter(e.target.value)
            setRoomFilter("") // reset local state too
            handleFilterChange('area', e.target.value)
          }}
          className="py-2 px-3 border border-gray-300 bg-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tất cả khu vực</option>
          {areas.map((a: any) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <select
          value={roomFilter}
          onChange={(e) => {
            setRoomFilter(e.target.value)
            handleFilterChange('room', e.target.value)
          }}
          className="py-2 px-3 border border-gray-300 bg-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tất cả phòng</option>
          {availableRooms.map((r: any) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            handleFilterChange('category', e.target.value)
          }}
          className="py-2 px-3 border border-gray-300 bg-white rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
