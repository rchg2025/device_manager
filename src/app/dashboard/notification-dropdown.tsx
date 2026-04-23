"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, ClipboardList } from "lucide-react"
import Link from "next/link"

export default function NotificationDropdown({ 
  unreadCount, 
  notifications 
}: { 
  unreadCount: number, 
  notifications: any[] 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800">Thông báo mới</h3>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif: any) => (
                <Link 
                  href={notif.link || "/dashboard/requests"} 
                  key={notif.id}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                    <div>
                      <p className={`text-sm ${!notif.isRead ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-500 flex flex-col items-center">
                <Bell className="w-8 h-8 text-gray-300 mb-2" />
                Không có thông báo nào.
              </div>
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <Link 
              href="/dashboard/requests" 
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 text-center block w-full"
            >
              Xem toàn bộ lịch sử
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
