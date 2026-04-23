"use client"

import { useState, useEffect } from "react"
import { AlertCircle, X } from "lucide-react"

export default function OverdueAlert({ overdueItems }: { overdueItems: any[] }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (overdueItems && overdueItems.length > 0) {
      setIsVisible(true)
      
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 10000) // 10 seconds
      
      return () => clearTimeout(timer)
    }
  }, [overdueItems])

  if (!isVisible || overdueItems.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-10 fade-in duration-300 max-w-md w-full">
      <div className="bg-white border-l-4 border-red-500 shadow-xl rounded-lg overflow-hidden">
        <div className="p-4 bg-red-50 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-800 font-bold text-sm">Cảnh báo Quá hạn!</h3>
            <p className="text-red-700 text-sm mt-1">
              Bạn đang có thiết bị đang mượn quá thời gian trả vui lòng trả thiết bị về cho bộ phận quản lý.
            </p>
          </div>
          <button onClick={() => setIsVisible(false)} className="text-red-400 hover:text-red-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-white px-4 py-3 border-t border-red-100 max-h-48 overflow-y-auto">
          <ul className="space-y-2">
            {overdueItems.map(item => (
              <li key={item.id} className="text-sm flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-gray-800 truncate pr-2">{item.equipment.name}</span>
                <span className="text-red-600 font-semibold whitespace-nowrap bg-red-50 px-2 py-0.5 rounded text-xs">
                  Trễ hạn
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
