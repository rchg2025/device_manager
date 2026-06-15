"use client"
import { useState } from "react"
import { updateSuperadminAccount, deleteSuperadminAccount } from "./actions"
import { useConfirm } from "@/components/ui/use-confirm"

export default function AccountRow({ account, units }: { account: any, units: any[] }) {
  const { confirm } = useConfirm()
  const [isEditing, setIsEditing] = useState(false)
  const [role, setRole] = useState(account.role)
  
  if (isEditing) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-4">
          <form action={async (formData) => {
            const res = await updateSuperadminAccount(formData)
            if (res?.error) alert(res.error)
            else setIsEditing(false)
          }} className="bg-gray-50 p-4 rounded-md border grid grid-cols-2 gap-4">
            <input type="hidden" name="id" value={account.id} />
            <div>
              <label className="block text-xs font-medium text-gray-700">Họ tên</label>
              <input type="text" name="name" defaultValue={account.name} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Email</label>
              <input type="email" disabled defaultValue={account.email} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm py-2 px-3 border" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Số điện thoại</label>
              <input type="text" name="phone" defaultValue={account.phone || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Mật khẩu mới (để trống nếu không đổi)</label>
              <input type="password" name="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Quyền hạn</label>
              <select name="role" value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border">
                <option value="SUPERADMIN">Superadmin</option>
                <option value="SUPERVISOR">Giám sát</option>
              </select>
            </div>
            {role === "SUPERVISOR" && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700">Chi nhánh quản lý (Chọn nhiều)</label>
                <select name="supervisedUnitIds" multiple defaultValue={account.supervisedUnits.map((u: any) => u.id)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border h-32">
                  {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều</p>
              </div>
            )}
            <div className="col-span-2 flex justify-end space-x-2 mt-2">
              <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm font-medium">Hủy</button>
              <button type="submit" className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm font-medium">Lưu</button>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.phone}</td>
      <td className="px-6 py-4 text-sm text-gray-500">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${account.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
          {account.role}
        </span>
        {account.role === "SUPERVISOR" && account.supervisedUnits.length > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            {account.supervisedUnits.map((u: any) => u.name).join(", ")}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-900 mr-4">Sửa</button>
        <button onClick={async () => {
          if (await confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
            const res = await deleteSuperadminAccount(account.id)
            if (res?.error) alert(res.error)
          }
        }} className="text-red-600 hover:text-red-900">Xóa</button>
      </td>
    </tr>
  )
}
