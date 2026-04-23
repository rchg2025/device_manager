import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Package, ClipboardList, CheckCircle } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  const role = session?.user?.role || "MEMBER"

  if (role === "MEMBER") {
    // Member Dashboard
    const requests = await prisma.borrowRequest.findMany({
      where: { userId: session?.user?.id },
      include: { equipment: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Xin chào, {session?.user?.name}</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Lịch sử mượn gần đây</h3>
          {requests.length === 0 ? (
            <p className="text-gray-500">Chưa có lịch sử mượn thiết bị.</p>
          ) : (
            <ul className="divide-y">
              {requests.map((req: any) => (
                <li key={req.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{req.equipment.name}</p>
                    <p className="text-sm text-gray-500">Số lượng: {req.quantity}</p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      req.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                      req.status === 'RETURNED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {req.status === 'PENDING' ? 'Chờ duyệt' :
                       req.status === 'APPROVED' ? 'Đang mượn' :
                       req.status === 'RETURNED' ? 'Đã trả' : 'Từ chối'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )
  }

  // Admin / Manager Dashboard
  const [totalEquipments, pendingRequests, activeBorrows] = await Promise.all([
    prisma.equipment.aggregate({ _sum: { totalQty: true } }),
    prisma.borrowRequest.count({ where: { status: 'PENDING' } }),
    prisma.borrowRequest.count({ where: { status: 'APPROVED' } }),
  ])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tổng quan hệ thống</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-lg mr-4">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng thiết bị</p>
            <p className="text-2xl font-bold">{totalEquipments._sum.totalQty || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-lg mr-4">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Yêu cầu chờ duyệt</p>
            <p className="text-2xl font-bold">{pendingRequests}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-4 bg-green-50 text-green-600 rounded-lg mr-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Đang cho mượn</p>
            <p className="text-2xl font-bold">{activeBorrows}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
