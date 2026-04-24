"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export default function MemberFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get("query") || "")
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "")

  // Debounce logic for smart search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query) {
        params.set("query", query)
      } else {
        params.delete("query")
      }

      if (roleFilter) {
        params.set("role", roleFilter)
      } else {
        params.delete("role")
      }

      params.delete("page") // Reset to page 1 on new search
      router.push(`/dashboard/members?${params.toString()}`)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [query, roleFilter, router, searchParams])

  return (
    <div className="flex gap-4 mb-4 items-center">
      <div className="flex-1 max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tra cứu tên hoặc email thành viên..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        />
      </div>
      <div className="w-48">
        <select 
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            // Bypass debounce for select changes
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value) params.set("role", e.target.value);
            else params.delete("role");
            params.delete("page");
            router.push(`/dashboard/members?${params.toString()}`);
          }}
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">Tất cả quyền hạn</option>
          <option value="ADMIN">ADMIN</option>
          <option value="MANAGER">MANAGER</option>
          <option value="MEMBER">MEMBER</option>
        </select>
      </div>
    </div>
  )
}
