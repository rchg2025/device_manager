"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(searchParams.get("q") || "")
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "")
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "")

  const handleFilter = (e?: React.FormEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set("q", q)
    else params.delete("q")
    
    if (startDate) params.set("startDate", startDate)
    else params.delete("startDate")
    
    if (endDate) params.set("endDate", endDate)
    else params.delete("endDate")
    
    params.set("page", "1")
    router.push(`/dashboard/maintenance?${params.toString()}`)
  }

  const handleClear = () => {
    setQ("")
    setStartDate("")
    setEndDate("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    params.delete("startDate")
    params.delete("endDate")
    params.set("page", "1")
    router.push(`/dashboard/maintenance?${params.toString()}`)
  }

  return (
    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm thiết bị, mã vạch, mô tả hoặc người xử lý..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <input 
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="block w-full sm:w-auto border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="text-gray-500 hidden sm:inline">-</span>
        <input 
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="block w-full sm:w-auto border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md text-sm hover:bg-blue-700">
          Lọc
        </button>
        <button type="button" onClick={handleClear} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md text-sm hover:bg-gray-200 border border-gray-300">
          Xóa
        </button>
      </div>
    </form>
  )
}
