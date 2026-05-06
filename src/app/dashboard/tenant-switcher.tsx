"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Building, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

export default function TenantSwitcher({ 
  units, 
  currentTenantId,
  role
}: { 
  units: { id: string, name: string }[], 
  currentTenantId: string | null,
  role?: string
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSwitch = (unitId: string) => {
    document.cookie = `tenantId=${unitId}; path=/; max-age=86400`;
    setIsOpen(false)
    
    const toastId = toast.loading("Đang chuyển đổi dữ liệu...")
    startTransition(() => {
      router.refresh()
      // Toast sẽ được dismiss thông qua useEffect hoặc timeout nếu cần,
      // nhưng với router.refresh, ta có thể dùng timeout hoặc theo dõi isPending
    })
    
    // Một mẹo nhỏ: Next.js router.refresh() không trả về promise, 
    // ta dùng setTimeout kết hợp hoặc effect để tắt toast
    setTimeout(() => {
      toast.dismiss(toastId)
      toast.success("Đã chuyển đổi thành công!")
    }, 1500)
  }

  const currentUnit = units.find(u => u.id === currentTenantId) || units[0]

  return (
    <div className="relative">
      <button 
        disabled={isPending}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200 shadow-sm disabled:opacity-70"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building className="w-4 h-4" />}
        <span className="hidden sm:inline">
          {isPending ? "Đang xử lý..." : (currentUnit ? currentUnit.name : "Đang tải...")}
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
