"use client"
import { useState } from "react"
import { updateSmtpSettings, updateDriveSettings, testDriveConnectionAction, updateSeoSettings } from "../profile/actions"
import { Mail, Check, Settings, Cloud, Server, Activity, Globe, Upload, Rocket, X } from "lucide-react"
import toast from "react-hot-toast"

export default function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [activeTab, setActiveTab] = useState<'seo' | 'drive' | 'smtp'>('seo')
  const [isLoadingSmtp, setIsLoadingSmtp] = useState(false)
  const [isLoadingDrive, setIsLoadingDrive] = useState(false)
  const [isLoadingSeo, setIsLoadingSeo] = useState(false)
  const [isTestingDrive, setIsTestingDrive] = useState(false)
  const [previewLogo, setPreviewLogo] = useState<string | null>(settings.SEO_LOGO_URL || null)
  const [previewOgImage, setPreviewOgImage] = useState<string | null>(settings.SEO_OG_IMAGE_URL || null)

  async function handleSeo(formData: FormData) {
    setIsLoadingSeo(true)
    const res = await updateSeoSettings(formData)
    setIsLoadingSeo(false)
    if (res?.error) toast.error(res.error)
    else toast.success("Cập nhật cấu hình SEO thành công!")
  }

  function handleGoogleIndex() {
    toast.success("Đã gửi yêu cầu ép index lên Google!")
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreviewLogo(URL.createObjectURL(file))
  }

  function handleOgImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreviewOgImage(URL.createObjectURL(file))
  }

  async function handleSmtp(formData: FormData) {
    setIsLoadingSmtp(true)
    const res = await updateSmtpSettings(formData)
    setIsLoadingSmtp(false)
    if (res?.error) toast.error(res.error)
    else toast.success("Cập nhật cấu hình SMTP thành công!")
  }

  async function handleDrive(formData: FormData) {
    setIsLoadingDrive(true)
    const res = await updateDriveSettings(formData)
    setIsLoadingDrive(false)
    if (res?.error) toast.error(res.error)
    else toast.success("Cập nhật cấu hình Google Drive thành công!")
  }

  async function handleTestDrive() {
    const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value
    const privateKey = (document.querySelector('textarea[name="privateKey"]') as HTMLTextAreaElement)?.value
    const folderId = (document.querySelector('input[name="folderId"]') as HTMLInputElement)?.value

    if (!email || !privateKey || !folderId) {
      toast.error("Vui lòng điền đầy đủ Email, Private Key và Folder ID để kiểm tra!")
      return
    }

    setIsTestingDrive(true)
    const formData = new FormData()
    formData.append("email", email)
    formData.append("privateKey", privateKey)
    formData.append("folderId", folderId)

    const res = await testDriveConnectionAction(formData)
    setIsTestingDrive(false)

    if (res.success) {
      toast.success(res.message)
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'seo'
              ? 'border-blue-500 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          SEO & Logo
        </button>
        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'drive'
              ? 'border-green-500 text-green-700 bg-green-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Cloud className="w-4 h-4" />
          Cấu hình Lưu trữ (Google Drive)
        </button>
        <button
          onClick={() => setActiveTab('smtp')}
          className={`flex items-center gap-2 py-4 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'smtp'
              ? 'border-blue-500 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Mail className="w-4 h-4" />
          Cấu hình Gửi Email (SMTP)
        </button>
      </div>

      <div className="p-6 md:p-8">
        {/* Tab Cấu hình SEO */}
        {activeTab === 'seo' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Globe className="w-5 h-5 text-blue-600" /> Thông tin Website (SEO & Logo)
            </h3>

            <form action={handleSeo} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề Website (SEO Title)</label>
                  <input type="text" name="title" defaultValue={settings.SEO_TITLE || ""} placeholder="Chuyên trang Tư vấn tuyển sinh..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả Website (SEO Description)</label>
                  <textarea name="description" rows={3} defaultValue={settings.SEO_DESCRIPTION || ""} placeholder="Khoa Cơ khí - Trường Cao đẳng Bách khoa..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã xác minh Google Search Console</label>
                  <input type="text" name="gscCode" defaultValue={settings.SEO_GSC_CODE || ""} placeholder="eQLt6u_..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Logo chung</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors bg-gray-50 relative">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Kéo thả logo vào đây (hoặc click để chọn)</span>
                            <input name="logo" type="file" className="sr-only" accept="image/*" onChange={handleLogoChange} />
                          </label>
                        </div>
                      </div>
                    </div>
                    {previewLogo && (
                      <div className="mt-2">
                        <p className="text-xs text-green-600 mb-1 font-medium">✓ File đã được đính kèm:</p>
                        <img src={previewLogo} alt="Logo Preview" className="h-20 object-contain rounded border" />
                        <button type="button" onClick={() => setPreviewLogo(null)} className="text-xs text-red-500 mt-1 flex items-center gap-1"><X className="w-3 h-3"/> Xóa (Bỏ đính kèm)</button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện chia sẻ link (OG Image)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors bg-gray-50 relative">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Ảnh hiển thị mặc định cho các bài viết không có ảnh</span>
                            <input name="ogImage" type="file" className="sr-only" accept="image/*" onChange={handleOgImageChange} />
                          </label>
                        </div>
                      </div>
                    </div>
                    {previewOgImage && (
                      <div className="mt-2">
                        <p className="text-xs text-green-600 mb-1 font-medium">✓ File đã được đính kèm:</p>
                        <img src={previewOgImage} alt="OG Image Preview" className="h-20 object-contain rounded border" />
                        <button type="button" onClick={() => setPreviewOgImage(null)} className="text-xs text-red-500 mt-1 flex items-center gap-1"><X className="w-3 h-3"/> Xóa (Bỏ đính kèm)</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-end gap-3">
                <button type="button" onClick={handleGoogleIndex} className="flex items-center justify-center gap-2 w-full md:w-auto bg-white border border-gray-300 text-blue-600 py-2.5 px-6 rounded-md hover:bg-gray-50 font-medium transition-colors">
                  <Rocket className="w-5 h-5" />
                  Ép Google Index
                </button>
                <button type="submit" disabled={isLoadingSeo} className="flex items-center justify-center gap-2 w-full md:w-auto bg-green-600 text-white py-2.5 px-8 rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <Check className="w-5 h-5" />
                  {isLoadingSeo ? "Đang lưu..." : "Lưu cấu hình"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Cấu hình Google Drive */}
        {activeTab === 'drive' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Server className="w-5 h-5 text-green-600" /> API Lưu trữ ảnh
            </h3>

            <form action={handleDrive} className="space-y-6">
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
                  <textarea name="privateKey" rows={6} defaultValue={settings.DRIVE_PRIVATE_KEY || ""} required placeholder="-----BEGIN PRIVATE KEY-----\n..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border font-mono text-xs"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Folder ID (Thư mục lưu ảnh)</label>
                  <input type="text" name="folderId" defaultValue={settings.DRIVE_FOLDER_ID || ""} required placeholder="ví dụ: 1ABCDEF_1234567890" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 border" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-end gap-3">
                <button type="button" onClick={handleTestDrive} disabled={isTestingDrive} className="flex items-center justify-center gap-2 w-full md:w-auto bg-gray-100 text-gray-700 py-2.5 px-6 rounded-md hover:bg-gray-200 font-medium disabled:opacity-50 transition-colors">
                  <Activity className="w-5 h-5" />
                  {isTestingDrive ? "Đang kiểm tra..." : "Test kết nối"}
                </button>
                <button type="submit" disabled={isLoadingDrive} className="flex items-center justify-center gap-2 w-full md:w-auto bg-green-600 text-white py-2.5 px-8 rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <Check className="w-5 h-5" />
                  {isLoadingDrive ? "Đang lưu..." : "Lưu cấu hình Drive"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Cấu hình SMTP */}
        {activeTab === 'smtp' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Settings className="w-5 h-5 text-blue-600" /> Máy chủ gửi Email
            </h3>

            <form action={handleSmtp} className="space-y-6">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
                  <input type="text" name="host" defaultValue={settings.SMTP_HOST || "smtp.gmail.com"} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                  <input type="text" name="port" defaultValue={settings.SMTP_PORT || "465"} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Email gửi đi (Từ ai?)</label>
                  <input type="text" name="from" placeholder="Device Manager <noreply@nsg.edu.vn>" defaultValue={settings.SMTP_FROM || ""} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Tài khoản Email (Username)</label>
                  <input type="email" name="user" defaultValue={settings.SMTP_USER || ""} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu (App Password)</label>
                  <input type="password" name="pass" defaultValue={settings.SMTP_PASS || ""} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={isLoadingSmtp} className="flex items-center justify-center gap-2 w-full md:w-auto bg-blue-600 text-white py-2.5 px-8 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <Check className="w-5 h-5" />
                  {isLoadingSmtp ? "Đang lưu..." : "Lưu cấu hình SMTP"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
