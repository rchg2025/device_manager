"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentRoomQuery = searchParams.get("room") || ""
  const currentManagerQuery = searchParams.get("manager") || ""
  const currentEquipmentQuery = searchParams.get("equipment") || ""

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set("page", "1") // reset to page 1 on filter change
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Tìm theo tên phòng..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          defaultValue={currentRoomQuery}
          onChange={(e) => {
            const val = e.target.value
            const timeout = setTimeout(() => updateFilters("room", val), 500)
            return () => clearTimeout(timeout)
          }}
        />
      </div>

      <div className="flex-1 relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Tìm theo quản lý..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          defaultValue={currentManagerQuery}
          onChange={(e) => {
            const val = e.target.value
            const timeout = setTimeout(() => updateFilters("manager", val), 500)
            return () => clearTimeout(timeout)
          }}
        />
      </div>

      <div className="flex-1 relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Tìm theo tên thiết bị..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          defaultValue={currentEquipmentQuery}
          onChange={(e) => {
            const val = e.target.value
            const timeout = setTimeout(() => updateFilters("equipment", val), 500)
            return () => clearTimeout(timeout)
          }}
        />
      </div>
    </div>
  )
}
