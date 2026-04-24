"use client"
import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock, Mail, KeyRound, ArrowLeft } from "lucide-react"
import { sendOtpToEmail, verifyOtp, resetPassword } from "./actions"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  // Các state cho Quên mật khẩu
  const [mode, setMode] = useState<"login" | "forgot_password" | "verify_otp" | "reset_password">("login")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail")
    const savedPassword = localStorage.getItem("rememberedPassword")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
    if (savedPassword) {
      setPassword(savedPassword)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email)
      localStorage.setItem("rememberedPassword", password)
    } else {
      localStorage.removeItem("rememberedEmail")
      localStorage.removeItem("rememberedPassword")
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    })
    
    setIsLoading(false)
    if (res?.error) {
      setError("Sai thông tin đăng nhập!")
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccess(""); setIsLoading(true)
    
    const res = await sendOtpToEmail(email)
    setIsLoading(false)
    
    if (res.error) {
      setError(res.error)
    } else {
      setSuccess("Mã OTP đã được gửi đến email của bạn!")
      setMode("verify_otp")
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccess(""); setIsLoading(true)
    
    const res = await verifyOtp(email, otp)
    setIsLoading(false)
    
    if (res.error) {
      setError(res.error)
    } else {
      setSuccess("Xác thực thành công. Vui lòng nhập mật khẩu mới.")
      setMode("reset_password")
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccess(""); setIsLoading(true)
    
    const res = await resetPassword(email, otp, newPassword)
    setIsLoading(false)
    
    if (res.error) {
      setError(res.error)
    } else {
      setSuccess("Đổi mật khẩu thành công! Đang chuyển hướng...")
      setTimeout(() => {
        setMode("login")
        setPassword("")
        setSuccess("")
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/logo.png" alt="NSG Logo" className="w-32 h-32 object-contain" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x font-sans tracking-tight">
          Hệ thống Quản lý Thiết bị
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Khoa Công nghệ thông tin - Kỹ thuật điện
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 relative overflow-hidden">
          
          {/* Hiệu ứng mờ khi tải */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm text-center font-medium">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm text-center font-medium">{success}</div>}

          {/* FORM ĐĂNG NHẬP CHÍNH */}
          {mode === "login" && (
            <>
              <form className="space-y-6" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên đăng nhập hoặc Email</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                      placeholder="Nhập email hoặc username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                      placeholder="Nhập mật khẩu"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                      Ghi nhớ đăng nhập
                    </label>
                  </div>

                  <div className="text-sm">
                    <button type="button" onClick={() => { setMode("forgot_password"); setError(""); setSuccess("") }} className="font-medium text-blue-600 hover:text-blue-500">
                      Quên mật khẩu?
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Đăng nhập
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Hoặc tiếp tục với</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
                    Đăng nhập bằng Google
                  </button>
                </div>
              </div>
            </>
          )}

          {/* FORM QUÊN MẬT KHẨU (NHẬP EMAIL) */}
          {mode === "forgot_password" && (
            <form className="space-y-6" onSubmit={handleForgotPassword}>
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Quên mật khẩu?</h3>
                <p className="text-sm text-gray-500 mt-1">Nhập email của bạn để nhận mã xác thực (OTP).</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email đã đăng ký</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder="example@nsg.edu.vn"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); setSuccess("") }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Gửi mã OTP
                </button>
              </div>
            </form>
          )}

          {/* FORM XÁC NHẬN OTP */}
          {mode === "verify_otp" && (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Xác thực OTP</h3>
                <p className="text-sm text-gray-500 mt-1">Vui lòng nhập mã OTP gồm 6 chữ số vừa được gửi đến <strong>{email}</strong>.</p>
              </div>
              
              <div>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-lg text-center font-bold tracking-widest border-gray-300 rounded-md py-3 border"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode("forgot_password")}
                  className="w-12 flex justify-center items-center py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-500 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          )}

          {/* FORM ĐẶT LẠI MẬT KHẨU MỚI */}
          {mode === "reset_password" && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Tạo mật khẩu mới</h3>
                <p className="text-sm text-gray-500 mt-1">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Lưu mật khẩu mới
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
