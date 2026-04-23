import Link from "next/link"
import { auth } from "@/auth"
import { LayoutDashboard, Package, Tags, ClipboardList, LogOut, Settings, Users } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const role = session?.user?.role || "MEMBER"

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
          
          <Link href="/dashboard/requests" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-600">
            <ClipboardList className="w-5 h-5" /> {role !== "MEMBER" ? "Yêu cầu mượn/trả" : "Lịch sử mượn trả"}
          </Link>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
          </div>
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 text-red-600 rounded-md hover:bg-red-50">
            <LogOut className="w-5 h-5" /> Đăng xuất
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
          <h1 className="text-lg font-bold text-blue-600">NSG Device</h1>
          <Link href="/api/auth/signout">
            <LogOut className="w-5 h-5 text-gray-600" />
          </Link>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
