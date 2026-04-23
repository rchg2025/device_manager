"use client"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteHistoryRecord } from "./actions"

export default function DeleteHistoryButton({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (confirm("Bạn có chắc chắn muốn xóa lịch sử mượn trả này? Hành động này không thể hoàn tác.")) {
      startTransition(async () => {
        const res = await deleteHistoryRecord(requestId)
        if (res?.error) {
          alert(res.error)
        } else {
          alert("Xóa thành công!")
          window.location.reload()
        }
      })
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:text-red-900 font-medium px-3 py-1 bg-red-50 hover:bg-red-100 rounded border border-red-200 shadow-sm ml-2"
    >
      {isPending ? "Đang xóa..." : "Xóa"}
    </button>
  )
}
