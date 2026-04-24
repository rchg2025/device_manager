import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Wrench, CheckCircle, Clock } from "lucide-react"
import MaintenanceActions from "./maintenance-actions"

export default async function MaintenancePage() {
  const session = await auth()
  if (session?.user?.role === "MEMBER") {
    redirect("/dashboard")
  }

  const maintenances = await prisma.maintenance.findMany({
    include: {
      equipment: { select: { name: true, image: true, barcode: true } }
    },
    orderBy: { date: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Lịch sử bảo trì & Sửa chữa</h2>
          <p className="text-gray-500 mt-1 text-sm">Theo dõi chi phí và tình trạng sửa chữa thiết bị trong kho.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả lỗi / Bảo trì</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày ghi nhận</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi phí (VNĐ)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {maintenances.map((mt: any) => (
              <tr key={mt.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                      {mt.equipment.image ? (
                        <img src={mt.equipment.image} alt={mt.equipment.name} className="w-full h-full object-cover" />
                      ) : (
                        <Wrench className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{mt.equipment.name}</div>
                      <div className="text-xs text-gray-500">{mt.equipment.barcode || "Không có mã vạch"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={mt.description}>
                  {mt.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(mt.date).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {mt.cost ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(mt.cost) : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full gap-1 items-center ${
                    mt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    mt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {mt.status === 'PENDING' && <Clock className="w-3 h-3" />}
                    {mt.status === 'IN_PROGRESS' && <Wrench className="w-3 h-3" />}
                    {mt.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                    
                    {mt.status === 'PENDING' ? 'Chờ sửa chữa' :
                     mt.status === 'IN_PROGRESS' ? 'Đang sửa' : 'Đã hoàn thành'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <MaintenanceActions maintenance={mt} role={session.user.role} />
                </td>
              </tr>
            ))}
            {maintenances.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  Chưa có dữ liệu bảo trì nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
