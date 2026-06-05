"use client"

import { FileSpreadsheet } from "lucide-react"

export default function ExportExcelButton({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const query = new URLSearchParams()
  if (searchParams.q) query.set("q", searchParams.q)
  if (searchParams.startDate) query.set("startDate", searchParams.startDate)
  if (searchParams.endDate) query.set("endDate", searchParams.endDate)
  if (searchParams.tab) query.set("tab", searchParams.tab)

  return (
    <a 
      href={`/api/export/maintenance?${query.toString()}`}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
    >
      <FileSpreadsheet className="w-4 h-4" /> Xuất Excel
    </a>
  )
}
