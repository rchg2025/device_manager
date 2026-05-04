"use client"
import { useState, useTransition } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { deleteInventoryRecord, deleteInventorySession } from "./actions"

export default function DeleteInventoryButton({ 
  id, 
  type 
}: { 
  id: string
  type: "record" | "session"
}) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    const msg = type === "record" 
      ? "Bạn có chắc chắn muốn xóa bản ghi này?" 
      : "Bạn có chắc chắn muốn xóa đợt kiểm kê này? Mọi bản ghi quét mã trong đợt này sẽ bị xóa."
      
    if (confirm(msg)) {
      startTransition(async () => {
        if (type === "record") {
          await deleteInventoryRecord(id)
        } else {
          await deleteInventorySession(id)
        }
      })
    }
  }

  return (
    <button 
      type="button" 
      onClick={handleDelete}
      disabled={isPending}
      className={`p-1 ${isPending ? 'text-gray-400' : 'text-red-500 hover:text-red-700'} transition-colors`}
      title={type === "record" ? "Xóa bản ghi" : "Xóa đợt kiểm kê"}
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
