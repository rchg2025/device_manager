import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { 
  Package, ClipboardList, CheckCircle, AlertTriangle, 
  ArrowRight, Activity, PlusCircle, Users, QrCode, 
  Calendar, Clock, ShieldAlert, BadgeCheck, MonitorPlay
} from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  const role = session?.user?.role || "MEMBER"
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (role === "MEMBER") {
    // -------------------------------------------------------------
    // MEMBER DASHBOARD
    // -------------------------------------------------------------
    const [
      activeBorrowsCount,
      pendingRequestsCount,
      overdueRequestsCount,
      requests
    ] = await Promise.all([
      prisma.borrowRequest.count({ where: { userId: session?.user?.id, status: 'APPROVED' } }),
      prisma.borrowRequest.count({ where: { userId: session?.user?.id, status: { in: ['PENDING', 'RETURN_REQUESTED'] } } }),
      prisma.borrowRequest.count({ where: { userId: session?.user?.id, status: 'APPROVED', returnDate: { lt: today } } }),
      prisma.borrowRequest.findMany({
        where: { userId: session?.user?.id },
        select: {
          id: true,
          quantity: true,
          status: true,
          borrowDate: true,
          returnDate: true,
          rejectionReason: true,
          equipment: { select: { name: true, image: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 6
      })
    ])

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Xin chào, {session?.user?.name}! 👋</h2>
            <p className="text-gray-500 mt-1">Chào mừng bạn quay lại hệ thống quản lý thiết bị.</p>
          </div>
          <Link href="/dashboard/borrow" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm w-full md:w-auto">
            <PlusCircle className="w-5 h-5" /> Đăng ký mượn thiết bị
          </Link>
        </div>

        {/* Thống kê cá nhân */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Đang sử dụng</p>
              <h3 className="text-3xl font-bold text-gray-800">{activeBorrowsCount}</h3>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="w-7 h-7" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Đang chờ xử lý</p>
              <h3 className="text-3xl font-bold text-gray-800">{pendingRequestsCount}</h3>
            </div>
            <div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <ClipboardList className="w-7 h-7" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Quá hạn trả</p>
              <h3 className="text-3xl font-bold text-red-600">{overdueRequestsCount}</h3>
            </div>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Lịch sử dạng Grid Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" /> Lịch sử giao dịch gần đây
            </h3>
            <Link href="/dashboard/requests" className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="p-6">
            {requests.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mt-6">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Chưa có yêu cầu mượn thiết bị</h3>
                  <p className="text-gray-500 mt-2 max-w-sm mx-auto">Bạn chưa từng mượn thiết bị nào trên hệ thống. Hãy bắt đầu bằng cách bấm nút Đăng ký mượn thiết bị ở trên.</p>
                </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map((req: any) => {
                  const getStatusUI = () => {
                    switch (req.status) {
                      case 'PENDING': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Chờ duyệt' }
                      case 'APPROVED': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Đang mượn' }
                      case 'RETURN_REQUESTED': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Chờ xác nhận trả' }
                      case 'RETURNED': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Đã trả' }
                      case 'REJECTED': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Từ chối' }
                      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: req.status }
                    }
                  }
                  const ui = getStatusUI()
                  
                  return (
                    <div key={req.id} className={`rounded-xl border ${ui.border} p-5 hover:shadow-md transition-shadow bg-white flex flex-col h-full`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ui.bg} ${ui.text}`}>
                          {ui.label}
                        </span>
                        <span className="text-sm font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          x{req.quantity}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {req.equipment.image ? (
                            <img src={req.equipment.image} alt={req.equipment.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-800 line-clamp-2" title={req.equipment.name}>
                          {req.equipment.name}
                        </h4>
                      </div>

                      <div className="mt-auto space-y-2 text-sm text-gray-600 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Mượn: {new Date(req.borrowDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className={req.status === 'APPROVED' && new Date(req.returnDate) < today ? "text-red-600 font-medium" : ""}>
                            Hẹn trả: {new Date(req.returnDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // ADMIN / MANAGER DASHBOARD
  // -------------------------------------------------------------
  const [
    equipmentStats,
    pendingRequestsCount,
    activeBorrowsCount,
    overdueRequestsCount,
    recentRequests,
    totalMembers,
    classroomEqStats,
    totalRooms,
    totalAreas
  ] = await Promise.all([
    prisma.equipment.aggregate({ _sum: { totalQty: true, availableQty: true } }),
    prisma.borrowRequest.count({ where: { status: { in: ['PENDING', 'RETURN_REQUESTED'] } } }),
    prisma.borrowRequest.count({ where: { status: 'APPROVED' } }),
    prisma.borrowRequest.count({ where: { status: 'APPROVED', returnDate: { lt: today } } }),
    prisma.borrowRequest.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      include: { user: { select: { name: true } }, equipment: { select: { name: true, image: true } } }
    }),
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.classroomEquipment.aggregate({ _sum: { quantity: true } }),
    prisma.room.count(),
    prisma.area.count()
  ])
  
  const totalQty = equipmentStats._sum.totalQty || 0
  const availableQty = equipmentStats._sum.availableQty || 0
  const borrowedQty = totalQty - availableQty
  const availablePercent = totalQty > 0 ? Math.round((availableQty / totalQty) * 100) : 0
  const borrowedPercent = 100 - availablePercent
  
  const totalClassroomEq = classroomEqStats._sum.quantity || 0

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Trung tâm điều khiển</h2>
        <p className="text-gray-500 mt-1">Tổng quan tình hình thiết bị và yêu cầu mượn trả hôm nay.</p>
      </div>
      
      {/* 4 Khối Thống Kê Chính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-blue-50 opacity-50">
            <Package className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng thiết bị</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{totalQty}</h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-green-600 font-medium mt-4 z-10 flex items-center gap-1">
            <BadgeCheck className="w-3 h-3" /> Thiết bị chung trong kho
          </p>
        </div>



        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-green-50 opacity-50">
            <CheckCircle className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-medium text-gray-500">Đang cho mượn</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{borrowedQty}</h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-green-600 font-medium mt-4 z-10">
            {activeBorrowsCount} yêu cầu đang thực thi
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-yellow-50 opacity-50">
            <ClipboardList className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-medium text-gray-500">Cần xử lý ngay</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{pendingRequestsCount}</h3>
            </div>
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-yellow-600 font-medium mt-4 z-10">
            Chờ duyệt mượn / xác nhận trả
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-sm font-medium text-red-600">Quá hạn chưa trả</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">{overdueRequestsCount}</h3>
            </div>
            <div className="p-3 bg-red-100 text-red-600 rounded-lg group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <Link href="/dashboard/requests?filter=overdue" className="text-xs text-red-600 hover:text-red-800 font-medium mt-4 z-10 flex items-center gap-1 w-max">
            Xem danh sách <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Cột Trái: Trạng thái kho & Nút tắt */}
        <div className="xl:col-span-1 space-y-6">
          {/* Thanh Tiến độ Sức chứa Kho */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" /> Trạng thái Kho
            </h3>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-gray-600">Sẵn sàng: <span className="text-green-600">{availableQty}</span></span>
                <span className="text-gray-600">Đang mượn: <span className="text-blue-600">{borrowedQty}</span></span>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-green-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${availablePercent}%` }}
                  title={`${availablePercent}% Sẵn sàng`}
                ></div>
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${borrowedPercent}%` }}
                  title={`${borrowedPercent}% Đang mượn`}
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Kho hiện đang rảnh <strong className="text-gray-800">{availablePercent}%</strong> sức chứa.
            </p>
          </div>

          {/* Truy cập nhanh */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Lối tắt thao tác</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
              <Link href="/dashboard/equipments" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                <div className="bg-gray-100 p-2 rounded-md group-hover:bg-blue-100 group-hover:text-blue-600 text-gray-500"><PlusCircle className="w-5 h-5" /></div>
                <span className="font-medium text-sm">Thêm thiết bị mới</span>
              </Link>
              <Link href="/dashboard/equipments" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                <div className="bg-gray-100 p-2 rounded-md group-hover:bg-blue-100 group-hover:text-blue-600 text-gray-500"><QrCode className="w-5 h-5" /></div>
                <span className="font-medium text-sm">Quản lý mã QR</span>
              </Link>
              {role === "ADMIN" && (
                <Link href="/dashboard/members" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                  <div className="bg-gray-100 p-2 rounded-md group-hover:bg-blue-100 group-hover:text-blue-600 text-gray-500"><Users className="w-5 h-5" /></div>
                  <span className="font-medium text-sm">Tổng số {totalMembers} thành viên</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Cột Phải: Hoạt động gần đây */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" /> Lịch sử mượn thiết bị gần đây
            </h3>
            <Link href="/dashboard/requests" className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-0 flex-1">
            {recentRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                <ClipboardList className="w-12 h-12 mb-3 text-gray-300" />
                <p>Chưa có dữ liệu hoạt động</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recentRequests.map((req: any) => {
                  const isActionRequired = req.status === 'PENDING' || req.status === 'RETURN_REQUESTED'
                  
                  return (
                    <li key={req.id} className={`p-4 sm:px-6 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4 ${isActionRequired ? 'bg-yellow-50/30' : ''}`}>
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                          {req.equipment.image ? (
                            <img src={req.equipment.image} alt={req.equipment.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate" title={req.equipment.name}>
                            {req.equipment.name} <span className="text-gray-400 font-normal">x{req.quantity}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                            Bởi <strong className="text-gray-700">{req.user.name}</strong> 
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          req.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          req.status === 'APPROVED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          req.status === 'RETURN_REQUESTED' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          req.status === 'RETURNED' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {req.status === 'PENDING' ? 'Chờ duyệt' :
                           req.status === 'APPROVED' ? 'Đang mượn' :
                           req.status === 'RETURN_REQUESTED' ? 'Chờ nhận trả' :
                           req.status === 'RETURNED' ? 'Đã trả' : 'Từ chối'}
                        </span>
                        
                        {isActionRequired && (
                          <Link href={`/dashboard/requests?filter=action_required`} className="hidden sm:flex p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors" title="Xử lý ngay">
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Thống kê Thiết bị Phòng học */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MonitorPlay className="w-6 h-6 text-purple-600" /> Thống kê Thiết bị Phòng học
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 flex flex-col items-center justify-center text-center shadow-inner">
            <p className="text-sm font-bold text-purple-700 mb-2 uppercase tracking-wide">Tổng Thiết bị</p>
            <h4 className="text-5xl font-extrabold text-purple-800 drop-shadow-sm">{totalClassroomEq}</h4>
            <p className="text-xs text-purple-600 mt-3 font-medium bg-purple-200 px-3 py-1 rounded-full">Đang lắp đặt & sử dụng</p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 flex flex-col items-center justify-center text-center shadow-inner">
            <p className="text-sm font-bold text-blue-700 mb-2 uppercase tracking-wide">Tổng Số Phòng</p>
            <h4 className="text-5xl font-extrabold text-blue-800 drop-shadow-sm">{totalRooms}</h4>
            <p className="text-xs text-blue-600 mt-3 font-medium bg-blue-200 px-3 py-1 rounded-full">Phòng học có thiết bị</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 flex flex-col items-center justify-center text-center shadow-inner">
            <p className="text-sm font-bold text-emerald-700 mb-2 uppercase tracking-wide">Số Khu Vực</p>
            <h4 className="text-5xl font-extrabold text-emerald-800 drop-shadow-sm">{totalAreas}</h4>
            <p className="text-xs text-emerald-600 mt-3 font-medium bg-emerald-200 px-3 py-1 rounded-full">Khu vực / Dãy nhà</p>
          </div>
        </div>
        
        {/* Biểu đồ phân bổ nguồn lực (CSS Visuals) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" /> Tỷ trọng Thiết bị / Phòng
            </h4>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-600">Trung bình thiết bị mỗi phòng</span>
                  <span className="text-purple-600 font-bold">{totalRooms > 0 ? Math.round(totalClassroomEq / totalRooms) : 0} tb / phòng</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-purple-500 h-3 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" /> Mật độ Phòng / Khu vực
            </h4>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-600">Trung bình phòng mỗi khu vực</span>
                  <span className="text-blue-600 font-bold">{totalAreas > 0 ? Math.round(totalRooms / totalAreas) : 0} phòng / khu</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
