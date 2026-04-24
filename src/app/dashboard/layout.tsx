import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { LayoutDashboard, Package, Tags, ClipboardList, LogOut, Users, History, Settings, Wrench } from "lucide-react"
import OverdueAlert from "./overdue-alert"
import NotificationDropdown from "./notification-dropdown"
import AutoRefreshBadge from "./auto-refresh-badge"
import MobileMenu from "./mobile-menu"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const role = session?.user?.role || "MEMBER"

  let unreadCount = 0
  let overdueItems: any[] = []
  let notifications: any[] = []

  if (session?.user?.id) {
    if (role !== "MEMBER") {
      unreadCount = await prisma.borrowRequest.count({
        where: { status: { in: ["PENDING", "RETURN_REQUESTED"] } }
      })
    } else {
      // Fetch unread notifications for member
      unreadCount = await prisma.notification.count({
        where: { userId: session.user.id, isRead: false }
      })

      // Fetch top 5 notifications
      notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      // Fetch overdue items for member
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      overdueItems = await prisma.borrowRequest.findMany({
        where: {
          userId: session.user.id,
          status: "APPROVED",
          returnDate: { lt: today }
        },
        include: { equipment: { select: { name: true } } }
      })
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col hidden md:flex">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">NSG Device Manager</h1>
          <p className="text-sm text-gray-500">Khoa CNTT - KTĐ</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {role !== "MEMBER" && (
            <>
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600">
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </Link>
              <Link href="/dashboard/categories" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600">
                <Tags className="w-5 h-5" /> Quản lý danh mục
              </Link>
              <Link href="/dashboard/equipments" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600">
                <Package className="w-5 h-5" /> Quản lý thiết bị
              </Link>
              <Link href="/dashboard/maintenance" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600">
                <Wrench className="w-5 h-5" /> Bảo trì thiết bị
              </Link>
            </>
          )}

          {role === "ADMIN" && (
            <Link href="/dashboard/members" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600">
              <Users className="w-5 h-5" /> Quản lý thành viên
            </Link>
          )}

          {role === "MEMBER" && (
            <Link href="/dashboard/borrow" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600">
              <Package className="w-5 h-5" /> Mượn thiết bị mới
            </Link>
          )}
          
          {role !== "MEMBER" ? (
            <>
              <Link href="/dashboard/requests?filter=action_required" className="flex items-center justify-between px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-5 h-5" /> Yêu cầu mượn/trả
                </div>
                <AutoRefreshBadge initialCount={unreadCount} />
              </Link>
              <Link href="/dashboard/requests" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600">
                <History className="w-5 h-5" /> Lịch sử mượn trả
              </Link>
              {role === "ADMIN" && (
                <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 mt-4 border-t pt-4">
                  <Settings className="w-5 h-5" /> Cấu hình hệ thống
                </Link>
              )}
            </>
          ) : (
            <Link href="/dashboard/requests" className="flex items-center justify-between px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5" /> Lịch sử mượn trả
              </div>
              <AutoRefreshBadge initialCount={unreadCount} />
            </Link>
          )}
        </nav>

        <div className="p-4 border-t">
          <Link href="/dashboard/profile" className="flex items-center gap-3 mb-4 p-2 -mx-2 rounded-md hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
          </Link>
          <form action={async () => {
            "use server";
            const { signOut } = await import("@/auth");
            await signOut({ redirectTo: "/login" });
          }}>
            <button type="submit" className="flex items-center gap-3 px-3 py-2 text-red-600 rounded-md hover:bg-red-50 w-full text-left">
              <LogOut className="w-5 h-5" /> Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen relative">
        <OverdueAlert overdueItems={overdueItems} />
        
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center shrink-0">
          <div className="md:hidden flex items-center gap-2">
            <MobileMenu role={role} unreadCount={unreadCount} />
            <h1 className="text-lg font-bold text-blue-600">NSG Device</h1>
          </div>
          <div className="hidden md:block"></div> {/* Spacer */}
          
          <div className="flex items-center gap-4">
            {role === "MEMBER" && (
              <NotificationDropdown unreadCount={unreadCount} notifications={notifications} />
            )}
            
            <div className="md:hidden flex items-center gap-2">
              <Link href="/dashboard/profile" title="Quản lý tài khoản" className="flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </Link>
              <form action={async () => {
                "use server";
                const { signOut } = await import("@/auth");
                await signOut({ redirectTo: "/login" });
              }}>
                <button type="submit" title="Đăng xuất" className="flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
