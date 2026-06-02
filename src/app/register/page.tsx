"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Phone, Building, ArrowLeft, CheckCircle2 } from "lucide-react"
import { getUnits, getDepartmentsByUnit, registerUser } from "./actions"
import Image from "next/image"
import Link from "next/link"

export default function RegisterPage() {
  const [units, setUnits] = useState<{id: string, name: string}[]>([])
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([])
  
  const [unitId, setUnitId] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const router = useRouter()

  useEffect(() => {
    getUnits().then(data => setUnits(data))
  }, [])

  useEffect(() => {
    if (unitId) {
      getDepartmentsByUnit(unitId).then(data => setDepartments(data))
    } else {
      setDepartments([])
    }
  }, [unitId])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }

    setIsLoading(true)
    
    const formData = new FormData()
    formData.append("name", name)
    formData.append("email", email)
    formData.append("phone", phone)
    formData.append("password", password)
    formData.append("unitId", unitId)
    if (departmentId) formData.append("departmentId", departmentId)

    const res = await registerUser(formData)
    setIsLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image src="/logo.png" alt="NSG Logo" width={600} height={150} className="w-auto h-20 object-contain" priority />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x font-sans tracking-tight">
          Đăng ký Tài khoản
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Dành cho Giảng viên / Nhân viên
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md md:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 relative overflow-hidden">
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h3>
              <p className="text-gray-600 mb-8 px-4">
                Tài khoản của bạn đã được tạo và đang ở trạng thái <strong>chờ duyệt</strong>. 
                Một email đã được gửi đến Ban quản lý để phê duyệt tài khoản của bạn.
              </p>
              <Link href="/login" className="inline-flex justify-center items-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Quay lại trang Đăng nhập
              </Link>
            </div>
          ) : (
            <>
              {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md text-sm text-center font-medium border border-red-100">{error}</div>}
              
              <form className="space-y-5" onSubmit={handleRegister}>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị (Trường / Khoa) <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={unitId}
                      onChange={e => setUnitId(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2.5 px-3 border"
                    >
                      <option value="" disabled>Chọn đơn vị công tác</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bộ phận (Nội bộ)</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        value={departmentId}
                        onChange={e => setDepartmentId(e.target.value)}
                        disabled={!unitId || departments.length === 0}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 sm:text-sm border-gray-300 rounded-md py-2.5 px-3 border disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="">{departments.length === 0 && unitId ? "Không có bộ phận con" : "Chọn bộ phận (tùy chọn)"}</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên <span className="text-red-500">*</span></label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                      placeholder="VD: Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                        placeholder="example@nsg.edu.vn"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                        placeholder="0912345678"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                        placeholder="Ít nhất 6 ký tự"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 border"
                        placeholder="Nhập lại mật khẩu"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Đăng ký tài khoản
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Đã có tài khoản?{" "}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Đăng nhập ngay
                  </Link>
                </p>
              </div>
            </>
          )}

        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-12 text-center text-xs text-gray-500 max-w-lg mx-auto pb-4">
        <p>
          Bản quyền thuộc về <a href="https://rongcon.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Rồng Con HG</a>
        </p>
        <p className="mt-1">
          Số điện thoại hỗ trợ: <a href="tel:0917919522" className="text-blue-600 hover:underline">0917919522</a> - Email: <a href="mailto:nguyenluyen@nsg.edu.vn" className="text-blue-600 hover:underline">nguyenluyen@nsg.edu.vn</a>
        </p>
      </div>
    </div>
  )
}
