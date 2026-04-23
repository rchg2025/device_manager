"use client"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteHistoryRecord } from "./actions"

export default function DeleteHistoryButton({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    if (confirm("Bạn có chắc chắn muốn xóa lịch sử mượn trả này? Hành động này không thể hoàn tác.")) {
      setIsLoading(true)
      try {
        const res = await deleteHistoryRecord(requestId)
        if (res?.error) {
          alert(res.error)
        } else {
          alert("Xóa thành công!")
          window.location.reload()
        }
      } catch (err: any) {
        alert("Lỗi kết nối hoặc máy chủ: " + err.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isLoading}
      className="text-red-600 hover:text-red-900 font-medium px-3 py-1 bg-red-50 hover:bg-red-100 rounded border border-red-200 shadow-sm ml-2"
    >
      {isLoading ? "Đang xóa..." : "Xóa"}
    </button>
  )
}
