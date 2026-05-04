"use client"
import { useState } from "react"
import { Download, Loader2 } from "lucide-react"

export default function ExportInventoryButton({ sessionId }: { sessionId?: string }) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const params = sessionId ? `?sessionId=${sessionId}` : ""
      const res = await fetch(`/api/export/inventory${params}`)
      if (!res.ok) throw new Error("Lỗi xuất file")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `KiemKe_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert("Không thể xuất file Excel. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      Xuất Excel
    </button>
  )
}
