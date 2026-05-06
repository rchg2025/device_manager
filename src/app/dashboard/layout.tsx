import Link from "next/link"
import Image from "next/image"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { LayoutDashboard, Package, Tags, ClipboardList, LogOut, Users, History, Settings, Wrench, MonitorPlay, ClipboardCheck, ShieldAlert, Building } from "lucide-react"
import OverdueAlert from "./overdue-alert"
import NotificationDropdown from "./notification-dropdown"
import AutoRefreshBadge from "./auto-refresh-badge"
import MobileMenu from "./mobile-menu"
import DesktopSidebarWrapper from "./desktop-sidebar"
import { cookies } from "next/headers"
import TenantSwitcher from "./tenant-switcher"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const role = session?.user?.role || "MEMBER"

  let unreadCount = 0
  let pendingRequestsCount = 0
  let overdueItems: any[] = []
  let notifications: any[] = []
  let units: any[] = []
  let currentTenantId: string | null = null

  if (role === "SUPERADMIN" || role === "SUPERVISOR") {
    if (role === "SUPERADMIN") {
      const { unstable_cache } = await import("next/cache");
      const getCachedUnits = unstable_cache(
        async () => {
          const { basePrisma } = await import("@/lib/prisma");
          return await basePrisma.unit.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
        },
        ['dashboard-layout-units'],
        { revalidate: 3600, tags: ['units'] }
      );
      units = await getCachedUnits();
    } else {
      const userWithUnits = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { supervisedUnits: { select: { id: true, name: true }, orderBy: { name: 'asc' } } }
      });
      units = userWithUnits?.supervisedUnits || [];
    }
    const c = await cookies();
    currentTenantId = c.get('tenantId')?.value || "";
  }

  if (session?.user?.id) {
    // Determine queries to run based on role
    const queries = [];
    
    // 0: Unread notifications count
    queries.push(prisma.notification.count({
      where: { userId: session.user.id, isRead: false }
    }));
    
    // 1: Top 5 notifications
    queries.push(prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    }));

    if (role !== "MEMBER") {
      // 2: Pending requests count for managers/admins
      let whereClause: any = { status: { in: ["PENDING", "RETURN_REQUESTED"] } }
      queries.push(prisma.borrowRequest.count({
        where: whereClause
      }));
    } else {
      // 2: Overdue items for members
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      queries.push(prisma.borrowRequest.findMany({
        where: {
          userId: session.user.id,
          status: "APPROVED",
          returnDate: { lt: today }
        },
        include: { equipment: { select: { name: true } } }
      }));
    }

    const results = await prisma.$transaction(queries as any);

    unreadCount = results[0] as number;
    notifications = results[1] as any[];
    
    if (role !== "MEMBER") {
      pendingRequestsCount = results[2] as number;
    } else {
      overdueItems = results[2] as any[];
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Sidebar Wrapper */}
      <DesktopSidebarWrapper>
        <div className="p-4 border-b flex flex-col items-center">
          <Link prefetch={false} href="/dashboard" className="flex flex-col items-center hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="NSG Logo" width={200} height={64} className="h-16 w-auto object-contain mb-2" priority />
            <h1 className="text-sm font-bold text-blue-600 whitespace-nowrap">Device Manager</h1>
            <p className="text-xs text-gray-500">Nam Sai Gon Polytechnic College</p>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link prefetch={false} href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
            <LayoutDashboard className="w-5 h-5 shrink-0" /> Tổng quan
          </Link>
          
          {/* Menu cho Quản trị viên/Quản lý */}
          {(role === "ADMIN" || role === "MANAGER" || role === "SUPERADMIN") && (
            <>
              <Link prefetch={false} href="/dashboard/categories" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
                <Tags className="w-5 h-5 shrink-0" /> Quản lý danh mục
              </Link>
              <Link prefetch={false} href="/dashboard/equipments" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
                <Package className="w-5 h-5 shrink-0" /> Quản lý thiết bị
              </Link>
              <Link prefetch={false} href="/dashboard/maintenance" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
                <Wrench className="w-5 h-5 shrink-0" /> Lịch sử Bảo trì TB
              </Link>
            </>
          )}

          {role === "SUPERVISOR" && (
            <Link prefetch={false} href="/dashboard/maintenance" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
              <Wrench className="w-5 h-5 shrink-0" /> Lịch sử Bảo trì TB
            </Link>
          )}

          {(role === "ADMIN" || role === "SUPERADMIN") && (
            <Link prefetch={false} href="/dashboard/members" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
              <Users className="w-5 h-5 shrink-0" /> Quản lý thành viên
            </Link>
          )}

          {role !== "SUPERVISOR" && (
            <Link prefetch={false} href="/dashboard/borrow" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
              <Package className="w-5 h-5 shrink-0" /> Đăng ký mượn thiết bị
            </Link>
          )}
          
          {role !== "MEMBER" ? (
            <>
              {(role === "ADMIN" || role === "MANAGER" || role === "SUPERADMIN") && (
                <Link prefetch={false} href="/dashboard/requests?filter=action_required" className="flex items-center justify-between px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5 shrink-0" /> Yêu cầu mượn/trả
                  </div>
                  <AutoRefreshBadge initialCount={pendingRequestsCount} />
                </Link>
              )}
              <Link prefetch={false} href="/dashboard/requests" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
                <History className="w-5 h-5 shrink-0" /> Lịch sử mượn trả
              </Link>

            </>
          ) : (
            <Link prefetch={false} href="/dashboard/requests" className="flex items-center justify-between px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 shrink-0" /> Lịch sử mượn trả
              </div>
              <AutoRefreshBadge initialCount={unreadCount} />
            </Link>
          )}

          {role !== "MEMBER" && (
            <>
              <hr className="my-2 border-gray-200" />
              {(role === "ADMIN" || role === "MANAGER" || role === "SUPERADMIN") && (
                <>
                  <Link prefetch={false} href="/dashboard/classroom-equipments" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
                    <MonitorPlay className="w-5 h-5 shrink-0" /> QL thiết bị phòng học
                  </Link>
                  <Link prefetch={false} href="/dashboard/classroom-equipments/list" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
                    <ClipboardList className="w-5 h-5 shrink-0" /> Danh sách thiết bị
                  </Link>
                </>
              )}
              {role === "SUPERVISOR" && (
                <Link prefetch={false} href="/dashboard/classroom-equipments/list" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
                  <ClipboardList className="w-5 h-5 shrink-0" /> Danh sách thiết bị
                </Link>
              )}
              <Link prefetch={false} href="/dashboard/classroom-maintenance" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
                <Wrench className="w-5 h-5 shrink-0" /> Lịch sử bảo trì TB phòng
              </Link>
              <hr className="my-2 border-gray-200" />
              <Link prefetch={false} href="/dashboard/inventory" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap">
                <ClipboardCheck className="w-5 h-5 shrink-0" /> Kiểm kê thiết bị
              </Link>
              {(role === "ADMIN" || role === "SUPERADMIN") && (
                <Link prefetch={false} href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600 mt-4 border-t pt-4 whitespace-nowrap">
                  <Settings className="w-5 h-5 shrink-0" /> Cấu hình hệ thống
                </Link>
              )}
              {(role === "ADMIN" || role === "SUPERADMIN") && (
                <Link prefetch={false} href="/dashboard/system-logs" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 whitespace-nowrap">
                  <ShieldAlert className="w-5 h-5 shrink-0" /> Nhật ký hệ thống
                </Link>
              )}
              {role === "SUPERADMIN" && (
                <>
                  <hr className="my-2 border-gray-200" />
                  <Link prefetch={false} href="/dashboard/superadmin/accounts" className="flex items-center gap-3 px-3 py-2 text-purple-700 rounded-md hover:bg-purple-50 hover:text-purple-600 whitespace-nowrap font-semibold border border-purple-100 bg-purple-50/50 mt-1">
                    <Users className="w-5 h-5 shrink-0" /> Tài khoản cấp cao
                  </Link>
                  <Link prefetch={false} href="/dashboard/superadmin/units" className="flex items-center gap-3 px-3 py-2 text-purple-700 rounded-md hover:bg-purple-50 hover:text-purple-600 whitespace-nowrap font-semibold border border-purple-100 bg-purple-50/50 mt-1">
                    <Building className="w-5 h-5 shrink-0" /> Quản lý đơn vị (SA)
                  </Link>
                  <Link prefetch={false} href="/dashboard/superadmin/transfer-data" className="flex items-center gap-3 px-3 py-2 text-purple-700 rounded-md hover:bg-purple-50 hover:text-purple-600 whitespace-nowrap font-semibold border border-purple-100 bg-purple-50/50 mt-1">
                    <Tags className="w-5 h-5 shrink-0" /> Chuyển dữ liệu (SA)
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        <div className="p-4 border-t">
          <Link prefetch={false} href="/dashboard/profile" className="flex items-center gap-3 mb-4 p-2 -mx-2 rounded-md hover:bg-gray-50 transition-colors">
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
            <button type="submit" className="flex items-center gap-3 px-3 py-2 text-red-600 rounded-md hover:bg-red-50 w-full text-left whitespace-nowrap">
              <LogOut className="w-5 h-5 shrink-0" /> Đăng xuất
            </button>
          </form>
        </div>
      </DesktopSidebarWrapper>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen relative min-w-0">
        <OverdueAlert overdueItems={overdueItems} />
        
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center shrink-0">
          <div className="xl:hidden flex items-center gap-2">
            <MobileMenu role={role} unreadCount={pendingRequestsCount} />
            <Link prefetch={false} href="/dashboard" className="hover:opacity-80 transition-opacity">
              <h1 className="text-lg font-bold text-blue-600 whitespace-nowrap">Device Manager</h1>
            </Link>
          </div>
          <div className="hidden xl:flex items-center gap-4">
            {(role === "SUPERADMIN" || role === "SUPERVISOR") && (
              <TenantSwitcher units={[{ id: "", name: "Tất cả đơn vị" }, ...units]} currentTenantId={currentTenantId} />
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationDropdown unreadCount={unreadCount} notifications={notifications} />
            
            <div className="xl:hidden flex items-center gap-2">
              <Link prefetch={false} href="/dashboard/profile" title="Quản lý tài khoản" className="flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-full">
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

        <div className="flex-1 overflow-y-auto p-4 xl:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
