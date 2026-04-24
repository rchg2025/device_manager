"use client"
import { useState } from "react"
import { updateProfile } from "./actions"
import { User, Shield, Check, Briefcase, Building2, Tag } from "lucide-react"

export default function ProfileForm({ user }: { user: any }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleProfile(formData: FormData) {
    setIsLoading(true)
    const res = await updateProfile(formData)
    setIsLoading(false)
    if (res?.error) alert(res.error)
    else alert("Cập nhật thông tin thành công!")
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">{user.name || "User"}</h3>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      <form action={handleProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột 1: Có thể chỉnh sửa */}
        <div className="space-y-6">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-blue-600" /> Thông tin cá nhân
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email đăng nhập</label>
            <input type="email" disabled value={user.email || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500 py-2 px-3 border cursor-not-allowed" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên hiển thị</label>
            <input type="text" name="name" defaultValue={user.name || ""} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
            <input type="password" name="password" placeholder="Để trống nếu không muốn đổi" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Tối thiểu 6 ký tự
            </p>
          </div>
        </div>

        {/* Cột 2: Thông tin hệ thống (Read-only) */}
        <div className="space-y-6">
          <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-blue-600" /> Thông tin công tác
          </h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" /> Đơn vị
            </label>
            <div className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-gray-700">
              {user.unit?.name || "Chưa cập nhật"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" /> Chức vụ
            </label>
            <div className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-gray-700">
              {user.position?.name || "Chưa cập nhật"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" /> Vai trò hệ thống
            </label>
            <div className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-gray-700 font-medium">
              {user.role === 'ADMIN' ? 'Quản trị viên (Admin)' : user.role === 'MANAGER' ? 'Quản lý (Manager)' : 'Thành viên (Member)'}
            </div>
          </div>
        </div>

        {/* Nút lưu nằm ở cuối cột 1 hoặc span cả 2 cột */}
        <div className="md:col-span-2 pt-4 border-t border-gray-100">
          <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 w-full md:w-auto md:px-8 bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Check className="w-5 h-5" /> {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  )
}
