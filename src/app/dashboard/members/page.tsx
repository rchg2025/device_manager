import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export default async function MembersPage() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const members = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  async function updateRole(formData: FormData) {
    "use server"
    const userId = formData.get("userId") as string
    const newRole = formData.get("role") as any
    
    if (userId && newRole) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
      })
      revalidatePath("/dashboard/members")
    }
  }

  async function deleteMember(formData: FormData) {
    "use server"
    const userId = formData.get("userId") as string
    if (userId) {
      await prisma.user.delete({
        where: { id: userId }
      })
      revalidatePath("/dashboard/members")
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý thành viên</h2>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và Tên</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền hạn</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-gray-900">
              {members.map((member: any) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{member.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <form action={async (formData) => { "use server"; await updateRole(formData) }} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={member.id} />
                      <select name="role" defaultValue={member.role} className="rounded border-gray-300 text-sm py-1">
                        <option value="MEMBER">Thành viên</option>
                        <option value="MANAGER">Quản lý</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button type="submit" className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100">Cập nhật</button>
                    </form>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <form action={async (formData) => { "use server"; await deleteMember(formData) }}>
                      <input type="hidden" name="userId" value={member.id} />
                      <button type="submit" className="text-red-600 hover:text-red-900 font-medium text-sm">Xóa</button>
                    </form>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có thành viên nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
