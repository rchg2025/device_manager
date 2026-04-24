import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import MemberRow from "./member-row"
import { createMember } from "./actions"
import ExcelButtons from "./excel-buttons"
import MemberFilterBar from "./filter-bar"
import Pagination from "../pagination"

export default async function MembersPage({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const sp = await searchParams;
  let page = parseInt(sp?.page as string)
  if (isNaN(page) || page < 1) page = 1
  const query = sp?.query || ""
  const roleFilter = sp?.role || ""
  const limit = 15
  const skip = (page - 1) * limit

  const whereClause: any = {
    email: { not: "nguyenluyen@nsg.edu.vn" }
  }

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } }
    ]
  }

  if (roleFilter) {
    whereClause.role = roleFilter
  }

  const [totalMembers, members, units, positions] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        unitId: true,
        positionId: true,
        unit: { select: { id: true, name: true } },
        position: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.unit.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.position.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
  ])

  const totalPages = Math.ceil(totalMembers / limit)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý thành viên</h2>
        <ExcelButtons />
      </div>
      
      {/* Thêm thành viên mới */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Thêm thành viên mới</h3>
        <form action={async (formData) => { "use server"; await createMember(formData) }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
            <input type="text" name="name" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Đăng nhập)</label>
            <input type="email" name="email" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" placeholder="email@domain.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input type="password" name="password" required className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" placeholder="Mật khẩu" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input type="text" name="phone" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" placeholder="0123456789" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
            <select name="unitId" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border">
              <option value="">-- Chọn đơn vị --</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
            <select name="positionId" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border">
              <option value="">-- Chọn chức vụ --</option>
              {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quyền hạn</label>
            <select name="role" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border">
              <option value="MEMBER">Thành viên</option>
              <option value="MANAGER">Quản lý</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
              Tạo tài khoản
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <MemberFilterBar />
        
        <div className="overflow-x-auto rounded-t-lg border border-gray-200 border-b-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và Tên</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn vị</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức vụ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền hạn</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-gray-900">
              {members.map((member: any) => (
                <MemberRow 
                  key={member.id} 
                  member={member} 
                  units={units} 
                  positions={positions} 
                />
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    Không tìm thấy thành viên nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination totalPages={totalPages} currentPage={page} />
      </div>
    </div>
  )
}
