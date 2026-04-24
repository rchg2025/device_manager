"use client"
import { useState } from "react"
import { MoreVertical, Edit, Trash2, ShieldAlert, MonitorPlay, QrCode } from "lucide-react"
import { updateClassroomEquipment, deleteClassroomEquipment } from "./actions"
import MaintenanceModal from "./maintenance-modal"
import QRModal from "./qr-modal"

export default function ClassroomEqRow({ 
  item, 
  areas,
  rooms,
  categories,
  configs 
}: { 
  item: any,
  areas: any[],
  rooms: any[],
  categories: any[],
  configs: any[]
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showQR, setShowQR] = useState(false)

  async function handleDelete() {
    if (confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
      const res = await deleteClassroomEquipment(item.id)
      if (res?.error) alert(res.error)
    }
  }

  if (isEditing) {
    return (
      <tr>
        <td colSpan={4} className="px-6 py-4">
          <form action={async (formData) => {
            const res = await updateClassroomEquipment(formData)
            if (res?.error) alert(res.error)
            else setIsEditing(false)
          }} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <input type="hidden" name="id" value={item.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên thiết bị</label>
                <input type="text" name="name" defaultValue={item.name} required className="w-full text-sm border-gray-300 rounded border px-2 py-1" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Khu vực</label>
                <select name="areaId" defaultValue={item.areaId} required className="w-full text-sm border-gray-300 rounded border px-2 py-1 bg-white">
                  {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phòng học</label>
                <select name="roomId" defaultValue={item.roomId} required className="w-full text-sm border-gray-300 rounded border px-2 py-1 bg-white">
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Danh mục</label>
                <select name="categoryId" defaultValue={item.categoryId} required className="w-full text-sm border-gray-300 rounded border px-2 py-1 bg-white">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Số lượng</label>
                <input type="number" name="quantity" defaultValue={item.quantity} required min="1" className="w-full text-sm border-gray-300 rounded border px-2 py-1" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ảnh đại diện mới (Tùy chọn)</label>
                <input type="file" name="image" accept="image/*" className="w-full text-sm border-gray-300 rounded border px-2 py-1 bg-white" />
                <input type="hidden" name="existingImage" value={item.image || ""} />
                {item.image && <p className="text-[10px] text-gray-500 mt-1">Đã có ảnh. Chọn file mới để thay thế.</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Cấu hình</label>
                <select name="configIds" multiple defaultValue={item.configs.map((c: any) => c.id)} className="w-full text-sm border-gray-300 rounded border px-2 py-1 bg-white h-24">
                  {configs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">Hủy</button>
              <button type="submit" className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">Lưu thay đổi</button>
            </div>
          </form>
        </td>
      </tr>
    )
  }

    let imgUrl = item.image;
    if (imgUrl?.includes('drive.google.com/uc?')) {
      try {
        const fileId = new URL(imgUrl).searchParams.get('id');
        if (fileId) imgUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
      } catch (e) {}
    }

    return (
      <>
        <tr className="hover:bg-gray-50 transition-colors">
          <td className="px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 relative">
                {imgUrl ? (
                  <img className="h-10 w-10 rounded-md object-cover border border-gray-200 bg-gray-50" src={imgUrl} alt="" loading="lazy" />
                ) : (
                <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center border border-blue-100">
                  <MonitorPlay className="h-5 w-5 text-blue-500" />
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-semibold text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.category?.name}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.configs.map((c: any) => (
                  <span key={c.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 font-medium">{item.room?.name}</div>
          <div className="text-xs text-gray-500">{item.area?.name}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">Số lượng: <span className="font-semibold">{item.quantity}</span></div>
          {item.creatorName && (
            <div className="text-xs text-gray-500 mt-2">
              <span className="font-medium">Thêm:</span> {item.creatorName} ({new Date(item.createdAt).toLocaleDateString('vi-VN')})
            </div>
          )}
          {item.updatedByName && (
            <div className="text-xs text-gray-500 mt-0.5">
              <span className="font-medium">Sửa:</span> {item.updatedByName} ({new Date(item.updatedAt).toLocaleDateString('vi-VN')})
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="relative inline-block text-left">
            <div className="flex items-center justify-end gap-2">
              <MaintenanceModal equipmentId={item.id} equipmentName={item.name} availableQty={item.quantity} isClassroomEq={true} />
              
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Edit className="w-4 h-4" /> Chỉnh sửa
                    </button>
                    <button onClick={() => { setShowQR(true); setShowMenu(false); }} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <QrCode className="w-4 h-4" /> Tạo mã QR
                    </button>
                    <button onClick={() => { handleDelete(); setShowMenu(false); }} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" /> Xóa thiết bị
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </td>
      </tr>

      {showQR && (
        <QRModal 
          isOpen={showQR} 
          onClose={() => setShowQR(false)} 
          equipment={{
            ...item,
            barcode: item.id // Use ID as barcode for classroom equipments
          }} 
        />
      )}
    </>
  )
}
