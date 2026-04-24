"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LayoutDashboard, Package, Tags, ClipboardList, Users, History, Settings, Wrench, MonitorPlay } from "lucide-react"
import AutoRefreshBadge from "./auto-refresh-badge"

export default function MobileMenu({ role, unreadCount }: { role: string, unreadCount: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="xl:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md">
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex xl:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={closeMenu}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
            <div className="p-4 flex justify-between items-center border-b">
              <h1 className="text-xl font-bold text-blue-600">Menu</h1>
              <button onClick={closeMenu} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {role !== "MEMBER" && (
                <>
                  <Link onClick={closeMenu} href="/dashboard" className={`flex items-center gap-3 px-3 py-3 rounded-md ${pathname === '/dashboard' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link onClick={closeMenu} href="/dashboard/categories" className={`flex items-center gap-3 px-3 py-3 rounded-md ${pathname === '/dashboard/categories' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                    <Tags className="w-5 h-5" /> Quản lý danh mục
                  </Link>
                  <Link onClick={closeMenu} href="/dashboard/equipments" className={`flex items-center gap-3 px-3 py-3 rounded-md ${pathname === '/dashboard/equipments' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                    <Package className="w-5 h-5" /> Quản lý thiết bị
                  </Link>
                  <Link onClick={closeMenu} href="/dashboard/maintenance" className={`flex items-center gap-3 px-3 py-3 rounded-md ${pathname === '/dashboard/maintenance' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                    <Wrench className="w-5 h-5" /> Bảo trì thiết bị
                  </Link>
                </>
              )}

              {role === "ADMIN" && (
                <Link onClick={closeMenu} href="/dashboard/members" className={`flex items-center gap-3 px-3 py-3 rounded-md ${pathname === '/dashboard/members' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                  <Users className="w-5 h-5" /> Quản lý thành viên
                </Link>
              )}

              <Link onClick={closeMenu} href="/dashboard/borrow" className={`flex items-center gap-3 px-3 py-3 rounded-md ${pathname === '/dashboard/borrow' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                <Package className="w-5 h-5" /> Đăng ký mượn thiết bị
              </Link>
              
              {role !== "MEMBER" ? (
                <>
                  <Link onClick={closeMenu} href="/dashboard/requests?filter=action_required" className={`flex items-center justify-between px-3 py-3 rounded-md ${pathname === '/dashboard/requests' && typeof window !== 'undefined' && window.location.search.includes('action_required') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-5 h-5" /> Yêu cầu mượn/trả
                    </div>
                    <AutoRefreshBadge initialCount={unreadCount} />
                  </Link>
                  <Link onClick={closeMenu} href="/dashboard/requests" className={`flex items-center gap-3 px-3 py-3 rounded-md ${pathname === '/dashboard/requests' && typeof window !== 'undefined' && !window.location.search.includes('action_required') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                    <History className="w-5 h-5" /> Lịch sử mượn trả
                  </Link>
                  {role === "ADMIN" && (
                    <Link onClick={closeMenu} href="/dashboard/settings" className={`flex items-center gap-3 px-3 py-3 rounded-md mt-2 border-t pt-4 ${pathname === '/dashboard/settings' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                      <Settings className="w-5 h-5" /> Cấu hình hệ thống
                    </Link>
                  )}
                </>
              ) : (
                <Link onClick={closeMenu} href="/dashboard/requests" className={`flex items-center justify-between px-3 py-3 rounded-md ${pathname === '/dashboard/requests' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5" /> Lịch sử mượn trả
                  </div>
                  <AutoRefreshBadge initialCount={unreadCount} />
                </Link>
              )}
              {role !== "MEMBER" && (
                <>
                  <hr className="my-2 border-gray-200" />
                  <Link onClick={closeMenu} href="/dashboard/classroom-equipments" className={`flex items-center gap-3 px-3 py-3 rounded-md ${pathname.startsWith('/dashboard/classroom-equipments') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}>
                    <MonitorPlay className="w-5 h-5" /> QL thiết bị phòng học
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
