"use client"

import { FileSpreadsheet } from "lucide-react"

export default function ExportExcelButton({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const query = new URLSearchParams()
  if (searchParams.name) query.set("name", searchParams.name)
  if (searchParams.category) query.set("category", searchParams.category)

  return (
    <a 
      href={`/api/export/equipments?${query.toString()}`}
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm transition-colors shadow-sm"
    >
      <FileSpreadsheet className="w-4 h-4" /> Xuất Excel
    </a>
  )
}
