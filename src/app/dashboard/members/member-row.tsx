"use client"
import { useState } from "react"
import { updateMember, deleteMember, toggleMemberStatus } from "./actions"
import { Trash2, Edit2, Check, X, Ban, Play } from "lucide-react"
import toast from "react-hot-toast"

export default function MemberRow({ member, units, departments, positions, currentUserRole }: { member: any, units: any[], departments: any[], positions: any[], currentUserRole?: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleUpdate(formData: FormData) {
    setIsLoading(true)
    formData.append("userId", member.id)
    await updateMember(formData)
    setIsEditing(false)
    setIsLoading(false)
  }

  async function handleDelete() {
    if (confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
      const formData = new FormData()
      formData.append("userId", member.id)
      const res = await deleteMember(formData)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Xóa thành công!")
        window.location.reload()
      }
    }
  }

  async function handleToggleStatus() {
    setIsLoading(true)
    const actionName = member.isActive ? "vô hiệu hóa" : "kích hoạt"
    if (confirm(`Bạn có chắc chắn muốn ${actionName} thành viên này?`)) {
      const res = await toggleMemberStatus(member.id, member.isActive)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(`${member.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} thành công!`)
        window.location.reload()
      }
    }
    setIsLoading(false)
  }

  if (isEditing) {
    return (
      <tr>
        <td colSpan={7} className="px-6 py-4">
          <form action={handleUpdate} className="grid grid-cols-6 gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Họ tên</label>
              <input type="text" name="name" defaultValue={member.name || ''} className="w-full border-gray-300 rounded text-sm py-1 px-2 border" />
            </div>
            {currentUserRole === "SUPERADMIN" && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Chi nhánh</label>
                <select name="unitId" defaultValue={member.unitId || ''} className="w-full border-gray-300 rounded text-sm py-1 px-2 border">
                  <option value="">-- Chọn --</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Đơn vị nội bộ</label>
              <select name="departmentId" defaultValue={member.departmentId || ''} className="w-full border-gray-300 rounded text-sm py-1 px-2 border">
                <option value="">-- Chọn --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Chức vụ</label>
              <select name="positionId" defaultValue={member.positionId || ''} className="w-full border-gray-300 rounded text-sm py-1 px-2 border">
                <option value="">-- Chọn --</option>
                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">SĐT</label>
              <input type="text" name="phone" defaultValue={member.phone || ''} className="w-full border-gray-300 rounded text-sm py-1 px-2 border" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Quyền</label>
              <select name="role" defaultValue={member.role} className="w-full border-gray-300 rounded text-sm py-1 px-2 border">
                <option value="MEMBER">Thành viên</option>
                <option value="MANAGER">Quản lý</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="flex items-end gap-2 h-full pb-1">
              <button type="submit" disabled={isLoading} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700">
                <Check className="w-4 h-4" /> Lưu
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-300">
                <X className="w-4 h-4" /> Hủy
              </button>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr className={member.isActive === false ? 'opacity-60 bg-gray-50' : ''}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{member.name || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{member.unit?.name || '-'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{member.department?.name || '-'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{member.position?.name || '-'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{member.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">{member.phone || '-'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          member.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
          member.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {member.role}
        </span>
        {member.isActive === false && (
          <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Vô hiệu hóa
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsEditing(true)} disabled={isLoading} className="text-indigo-600 hover:text-indigo-900" title="Chỉnh sửa">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={handleToggleStatus} disabled={isLoading} className={`${member.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`} title={member.isActive ? "Vô hiệu hóa" : "Kích hoạt"}>
            {member.isActive ? <Ban className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={handleDelete} disabled={isLoading} className="text-red-600 hover:text-red-900" title="Xóa">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
