import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <h3 className="text-lg font-semibold text-gray-800">Đang tải dữ liệu...</h3>
      <p className="text-gray-500 text-sm mt-1">Vui lòng đợi trong giây lát</p>
    </div>
  )
}
