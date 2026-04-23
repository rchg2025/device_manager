import { prisma } from "@/lib/prisma"
import { updateRequestStatus, requestReturn } from "./actions"
import { auth } from "@/auth"
import ReviewModal from "./review-modal"
import ReturnModal from "./return-modal"
import FilterBar from "./filter-bar"
import ExportExcelButton from "./export-excel-button"

export default async function RequestsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const session = await auth()
  const role = session?.user?.role

  // Wait for searchParams to be available in Next.js 15
  const sp = await searchParams;
  const nameFilter = sp?.name || ""
  const statusFilter = sp?.status || ""
  const equipmentFilter = sp?.equipment || ""
  const fromDate = sp?.fromDate || ""
  const toDate = sp?.toDate || ""

  // Build where clause dynamically
  const whereClause: any = {}
  
  if (role === "MEMBER") {
    whereClause.userId = session?.user?.id
  }

  if (nameFilter && role !== "MEMBER") {
    whereClause.user = {
      OR: [
        { name: { contains: nameFilter, mode: 'insensitive' } },
        { email: { contains: nameFilter, mode: 'insensitive' } }
      ]
    }
  }

  if (statusFilter) {
    whereClause.status = statusFilter
  }

  if (equipmentFilter) {
    whereClause.equipment = {
      name: { contains: equipmentFilter, mode: 'insensitive' }
    }
  }

  if (fromDate || toDate) {
    whereClause.createdAt = {}
    if (fromDate) {
      whereClause.createdAt.gte = new Date(fromDate)
    }
    if (toDate) {
      const toDateObj = new Date(toDate)
      toDateObj.setHours(23, 59, 59, 999)
      whereClause.createdAt.lte = toDateObj
    }
  }

  // Handle quick filters
  const filterParams = sp?.filter || ""
  if (filterParams === "action_required" && role !== "MEMBER") {
    whereClause.status = { in: ["PENDING", "RETURN_REQUESTED"] }
  }

  // Mark notifications as read for Member, and Admin/Manager
  if (session?.user?.id) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true }
    })
  }

  const requests = await prisma.borrowRequest.findMany({
    where: whereClause,
    include: { equipment: true, user: { include: { unit: true, position: true } } },
    orderBy: { createdAt: 'desc' }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">{role !== "MEMBER" ? (filterParams === "action_required" ? "Yêu cầu mượn/trả thiết bị" : "Lịch sử mượn trả") : "Lịch sử mượn trả"}</h2>
        {role !== "MEMBER" && <ExportExcelButton requests={requests} />}
      </div>

      <FilterBar role={role || "MEMBER"} />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {role !== "MEMBER" && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người mượn</th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian mượn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người xử lý</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((req: any) => {
              const isOverdue = role !== "MEMBER" && (req.status === "APPROVED" || req.status === "RETURN_REQUESTED") && new Date(req.returnDate) < today;
              
              return (
              <tr key={req.id} className={isOverdue ? "bg-red-50" : ""}>
                {role !== "MEMBER" && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isOverdue ? "text-red-900" : "text-gray-900"}`}>{req.user.name || req.user.email}</div>
                    <div className={`text-xs ${isOverdue ? "text-red-500" : "text-gray-500"}`}>{req.user.email}</div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={isOverdue ? "text-red-900 font-medium" : ""}>{req.equipment.name}</span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>{req.quantity}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                  {req.borrowDate.toLocaleDateString('vi-VN')} - {req.returnDate.toLocaleDateString('vi-VN')}
                  {isOverdue && <div className="text-xs text-red-500 mt-1 font-semibold">Đã quá hạn!</div>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'APPROVED' ? (isOverdue ? 'bg-red-200 text-red-900' : 'bg-blue-100 text-blue-800') :
                    req.status === 'RETURN_REQUESTED' ? (isOverdue ? 'bg-red-200 text-red-900' : 'bg-orange-100 text-orange-800') :
                    req.status === 'RETURNED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {req.status === 'PENDING' ? 'Chờ duyệt' :
                     req.status === 'APPROVED' ? 'Đang mượn' :
                     req.status === 'RETURN_REQUESTED' ? 'Chờ xác nhận trả' :
                     req.status === 'RETURNED' ? 'Đã trả' : 'Từ chối'}
                  </span>
                  {req.status === 'REJECTED' && req.rejectionReason && (
                    <div className="text-xs text-red-600 mt-1 max-w-[200px] break-words whitespace-normal">
                      Lý do: {req.rejectionReason}
                    </div>
                  )}
                  {req.status === 'RETURNED' && req.returnCondition && (
                    <div className="text-xs text-gray-500 mt-1 max-w-[200px] break-words whitespace-normal border-t pt-1 border-gray-100">
                      Tình trạng: {req.returnCondition}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {req.reviewerName ? (
                    <>
                      <div className="font-medium text-gray-900">{req.reviewerName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(req.updatedAt).toLocaleString('vi-VN')}</div>
                    </>
                  ) : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {role !== "MEMBER" ? (
                    <>
                      {req.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                          <ReviewModal req={req}>
                            <button className="text-blue-600 hover:text-blue-900 font-medium px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200">Xem & Xét Duyệt</button>
                          </ReviewModal>
                        </div>
                      )}
                      {(req.status === "APPROVED" || req.status === "RETURN_REQUESTED") && (
                        <div className="flex justify-end gap-2">
                          <ReturnModal req={req}>
                            <button className="text-green-600 hover:text-green-900 font-medium px-3 py-1 bg-green-50 hover:bg-green-100 rounded border border-green-200 shadow-sm">
                              {req.status === "RETURN_REQUESTED" ? "Xác nhận trả (Yêu cầu)" : "Xác nhận trả"}
                            </button>
                          </ReturnModal>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {req.status === "APPROVED" && (
                        <form action={async () => {
                          "use server"
                          await requestReturn(req.id)
                        }}>
                          <button type="submit" className="text-orange-600 hover:text-orange-900 font-medium px-3 py-1 bg-orange-50 hover:bg-orange-100 rounded border border-orange-200 shadow-sm">Đăng ký trả</button>
                        </form>
                      )}
                    </>
                  )}
                </td>
              </tr>
            )})}
            {requests.length === 0 && (
              <tr>
                <td colSpan={role !== "MEMBER" ? 7 : 6} className="px-6 py-8 text-center text-sm text-gray-500">
                  Không có yêu cầu nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
