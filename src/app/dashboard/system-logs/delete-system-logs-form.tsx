"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { deleteLogsByAge } from "./actions"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function DeleteSystemLogsForm() {
  const [age, setAge] = useState("15")
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let confirmMsg = `Bạn có chắc chắn muốn xóa nhật ký trước ${age} ngày?`
    if (age === "all") {
      confirmMsg = "CẢNH BÁO: Bạn có chắc chắn muốn xóa TẤT CẢ nhật ký? Thao tác này không thể hoàn tác!"
    }

    if (!confirm(confirmMsg)) return

    setIsDeleting(true)
    try {
      const parsedAge = age === 'all' ? 'all' : parseInt(age)
      const res = await deleteLogsByAge(parsedAge)
      if (res.error) {
        toast.error(res.error)
      } else {
        if (res.count === 0) {
          toast.success("Hệ thống không có bản ghi nào cũ hơn thời gian này để xóa.")
        } else {
          toast.success(`Đã xóa thành công ${res.count} bản ghi nhật ký!`)
        }
        router.refresh()
      }
    } catch (err: any) {
      toast.error("Lỗi máy chủ: " + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleDelete} className="flex items-center gap-2">
      <select 
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className="border border-red-300 bg-red-50 text-red-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
      >
        <option value="7">Trước 7 ngày</option>
        <option value="15">Trước 15 ngày</option>
        <option value="30">Trước 30 ngày</option>
        <option value="60">Trước 60 ngày</option>
        <option value="90">Trước 90 ngày</option>
        <option value="all">Xóa tất cả</option>
      </select>
      <button 
        type="submit" 
        disabled={isDeleting}
        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" /> {isDeleting ? "Đang xóa..." : "Xóa"}
      </button>
    </form>
  )
}
