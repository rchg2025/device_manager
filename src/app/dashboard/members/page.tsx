import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import MemberRow from "./member-row"

export default async function MembersPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const [members, units, positions] = await Promise.all([
    prisma.user.findMany({
      include: {
        unit: true,
        position: true,
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.unit.findMany({ orderBy: { name: 'asc' } }),
    prisma.position.findMany({ orderBy: { name: 'asc' } })
  ])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý thành viên</h2>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và Tên</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn vị</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chức vụ</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền hạn</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
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
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có thành viên nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
