"use client"
import { useState } from "react"
import { updateSmtpSettings, updateDriveSettings } from "../profile/actions"
import { Mail, Check, Settings, Cloud } from "lucide-react"

export default function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [isLoadingSmtp, setIsLoadingSmtp] = useState(false)
  const [isLoadingDrive, setIsLoadingDrive] = useState(false)

  async function handleSmtp(formData: FormData) {
    setIsLoadingSmtp(true)
    const res = await updateSmtpSettings(formData)
    setIsLoadingSmtp(false)
    if (res?.error) alert(res.error)
    else alert("Cập nhật cấu hình SMTP thành công!")
  }

  async function handleDrive(formData: FormData) {
    setIsLoadingDrive(true)
    const res = await updateDriveSettings(formData)
    setIsLoadingDrive(false)
    if (res?.error) alert(res.error)
    else alert("Cập nhật cấu hình Google Drive thành công!")
  }

  return (
    <div className="space-y-8">
      {/* Cấu hình Google Drive */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 md:p-8">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
          <Cloud className="w-5 h-5 text-green-600" /> Cấu hình API Lưu trữ ảnh (Google Drive)
        </h3>

        <form action={handleDrive} className="max-w-2xl space-y-6">
          <div className="bg-green-50 p-4 rounded-md border border-green-100 mb-6">
            <h4 className="font-semibold text-green-800 mb-2">Thông tin Service Account</h4>
            <p className="text-sm text-green-700">
              Vui lòng tạo Service Account trên Google Cloud Console, chia sẻ Folder Drive cho Email của Service Account với quyền "Người chỉnh sửa", và bật chia sẻ liên kết Folder "Bất kỳ ai có liên kết".
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Email (Email Service Account)</label>
              <input type="email" name="email" defaultValue={settings.DRIVE_CLIENT_EMAIL || ""} required placeholder="ví dụ: abc@project.iam.gserviceaccount.com" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Private Key</label>
              <textarea name="privateKey" rows={4} defaultValue={settings.DRIVE_PRIVATE_KEY || ""} required placeholder="-----BEGIN PRIVATE KEY-----\n..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border font-mono text-xs"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Folder ID (Thư mục lưu ảnh)</label>
              <input type="text" name="folderId" defaultValue={settings.DRIVE_FOLDER_ID || ""} required placeholder="ví dụ: 1ABCDEF_1234567890" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button type="submit" disabled={isLoadingDrive} className="flex items-center justify-center gap-2 w-full md:w-auto bg-green-600 text-white py-2.5 px-8 rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Check className="w-5 h-5" />
              {isLoadingDrive ? "Đang lưu..." : "Lưu cấu hình Drive"}
            </button>
          </div>
        </form>
      </div>

      {/* Cấu hình SMTP */}
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
              <input type="text" name="host" defaultValue={settings.SMTP_HOST || "smtp.gmail.com"} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
              <input type="text" name="port" defaultValue={settings.SMTP_PORT || "465"} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email gửi đi (Từ ai?)</label>
              <input type="text" name="from" placeholder="Device Manager ITE <noreply@nsg.edu.vn>" defaultValue={settings.SMTP_FROM || ""} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Tài khoản Email (Username)</label>
              <input type="email" name="user" defaultValue={settings.SMTP_USER || ""} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Mật khẩu (App Password)</label>
              <input type="password" name="pass" defaultValue={settings.SMTP_PASS || ""} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button type="submit" disabled={isLoadingSmtp} className="flex items-center justify-center gap-2 w-full md:w-auto bg-blue-600 text-white py-2.5 px-8 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Check className="w-5 h-5" />
              {isLoadingSmtp ? "Đang lưu..." : "Lưu cấu hình SMTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
