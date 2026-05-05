"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Building } from "lucide-react"

export default function TenantSwitcher({ 
  units, 
  currentTenantId 
}: { 
  units: { id: string, name: string }[], 
  currentTenantId: string | null 
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSwitch = (unitId: string) => {
    document.cookie = `tenantId=${unitId}; path=/; max-age=86400`;
    setIsOpen(false)
    router.refresh()
  }

  const currentUnit = units.find(u => u.id === currentTenantId) || units[0]

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200 shadow-sm"
      >
        <Building className="w-4 h-4" />
        <span className="hidden sm:inline">
          {currentUnit ? currentUnit.name : "Đang tải..."}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1">
            Chuyển góc nhìn (SUPERADMIN)
          </div>
          <div className="max-h-60 overflow-y-auto">
            {units.map(u => (
              <button
                key={u.id}
                onClick={() => handleSwitch(u.id)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${u.id === currentTenantId ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
