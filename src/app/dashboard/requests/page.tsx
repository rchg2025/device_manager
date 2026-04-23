import { prisma } from "@/lib/prisma"
import { updateRequestStatus } from "./actions"
import { auth } from "@/auth"

export default async function RequestsPage() {
  const session = await auth()
  const role = session?.user?.role

  // If member, only show their requests
  const whereClause = role === "MEMBER" ? { userId: session?.user?.id } : {}

  const requests = await prisma.borrowRequest.findMany({
    where: whereClause,
    include: { equipment: true, user: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Yêu cầu mượn/trả thiết bị</h2>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người mượn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian mượn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              {role !== "MEMBER" && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{req.user.name || req.user.email}</div>
                  <div className="text-xs text-gray-500">{req.user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.equipment.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {req.borrowDate.toLocaleDateString('vi-VN')} - {req.returnDate.toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                    req.status === 'RETURNED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {req.status === 'PENDING' ? 'Chờ duyệt' :
                     req.status === 'APPROVED' ? 'Đang mượn' :
                     req.status === 'RETURNED' ? 'Đã trả' : 'Từ chối'}
                  </span>
                </td>
                {role !== "MEMBER" && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {req.status === "PENDING" && (
                      <div className="flex justify-end gap-2">
                        <form action={async () => {
                          "use server"
                          await updateRequestStatus(req.id, "APPROVED")
                        }}>
                          <button type="submit" className="text-blue-600 hover:text-blue-900">Duyệt</button>
                        </form>
                        <form action={async () => {
                          "use server"
                          await updateRequestStatus(req.id, "REJECTED")
                        }}>
                          <button type="submit" className="text-red-600 hover:text-red-900">Từ chối</button>
                        </form>
                      </div>
                    )}
                    {req.status === "APPROVED" && (
                      <form action={async () => {
                        "use server"
                        await updateRequestStatus(req.id, "RETURNED")
                      }}>
                        <button type="submit" className="text-green-600 hover:text-green-900">Xác nhận trả</button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={role !== "MEMBER" ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Không có yêu cầu nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
