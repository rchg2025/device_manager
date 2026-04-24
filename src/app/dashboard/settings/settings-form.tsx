"use client"
import { useState } from "react"
import { updateSmtpSettings } from "../profile/actions"
import { Mail, Check, Settings } from "lucide-react"

export default function SettingsForm({ smtpSettings }: { smtpSettings: Record<string, string> }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSmtp(formData: FormData) {
    setIsLoading(true)
    const res = await updateSmtpSettings(formData)
    setIsLoading(false)
    if (res?.error) alert(res.error)
    else alert("Cập nhật cấu hình SMTP thành công!")
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 md:p-8">
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
        <Settings className="w-5 h-5 text-blue-600" /> Cấu hình máy chủ gửi Email (SMTP)
      </h3>

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
            <input type="text" name="from" placeholder="Device Manager ITE <noreply@nsg.edu.vn>" defaultValue={smtpSettings.SMTP_FROM || ""} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
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

        <div className="pt-4 border-t border-gray-100">
          <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 w-full md:w-auto bg-blue-600 text-white py-2.5 px-8 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Check className="w-5 h-5" /> {isLoading ? "Đang lưu..." : "Lưu cấu hình SMTP"}
          </button>
        </div>
      </form>
    </div>
  )
}
