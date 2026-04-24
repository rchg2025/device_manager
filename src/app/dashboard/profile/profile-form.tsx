"use client"
import { useState } from "react"
import { updateProfile, updateSmtpSettings } from "./actions"
import { User, Mail, Shield, Check } from "lucide-react"

export default function ProfileForm({ 
  user, 
  smtpSettings, 
  isAdmin 
}: { 
  user: any; 
  smtpSettings: Record<string, string>; 
  isAdmin: boolean 
}) {
  const [activeTab, setActiveTab] = useState<"profile" | "smtp">("profile")
  const [isLoading, setIsLoading] = useState(false)

  async function handleProfile(formData: FormData) {
    setIsLoading(true)
    const res = await updateProfile(formData)
    setIsLoading(false)
    if (res?.error) alert(res.error)
    else alert("Cập nhật thông tin thành công!")
  }

  async function handleSmtp(formData: FormData) {
    setIsLoading(true)
    const res = await updateSmtpSettings(formData)
    setIsLoading(false)
    if (res?.error) alert(res.error)
    else alert("Cập nhật cấu hình SMTP thành công!")
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === "profile" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
        >
          <User className="w-4 h-4" /> Thông tin cá nhân
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("smtp")}
            className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === "smtp" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
          >
            <Mail className="w-4 h-4" /> Cấu hình Email (SMTP)
          </button>
        )}
      </div>

      <div className="p-6 md:p-8">
        {activeTab === "profile" && (
          <form action={handleProfile} className="max-w-lg space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email (Tài khoản đăng nhập)</label>
              <input type="email" disabled value={user.email || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 py-2 px-3 border cursor-not-allowed" />
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

            <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              <Check className="w-4 h-4" /> {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        )}

        {activeTab === "smtp" && isAdmin && (
          <form action={handleSmtp} className="max-w-2xl space-y-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Hướng dẫn cấu hình Gmail
              </h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                <li>SMTP Host: <strong>smtp.gmail.com</strong></li>
                <li>SMTP Port: <strong>465</strong> (hoặc 587)</li>
                <li>Tài khoản Email: Email Gmail của bạn (VD: admin@gmail.com).</li>
                <li>Mật khẩu: <strong>Mật khẩu ứng dụng</strong> (App Password) - Không dùng mật khẩu đăng nhập. Xem hướng dẫn tạo tại tài khoản Google.</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
                <input type="text" name="host" defaultValue={smtpSettings.SMTP_HOST || "smtp.gmail.com"} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                <input type="text" name="port" defaultValue={smtpSettings.SMTP_PORT || "465"} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Email gửi đi (Từ ai?)</label>
                <input type="text" name="from" placeholder="NSG Device Manager <noreply@nsg.edu.vn>" defaultValue={smtpSettings.SMTP_FROM || ""} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Tài khoản Email (Username)</label>
                <input type="email" name="user" defaultValue={smtpSettings.SMTP_USER || ""} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Mật khẩu (App Password)</label>
                <input type="password" name="pass" defaultValue={smtpSettings.SMTP_PASS || ""} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              <Check className="w-4 h-4" /> {isLoading ? "Đang lưu..." : "Lưu cấu hình SMTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
