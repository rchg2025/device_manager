"use client"

import { FileSpreadsheet } from "lucide-react"

export default function ExportExcelButton({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const query = new URLSearchParams()
  if (searchParams.q && typeof searchParams.q === 'string') query.set("q", searchParams.q)
  if (searchParams.tab && typeof searchParams.tab === 'string') query.set("tab", searchParams.tab)
  else query.set("tab", "equipment")

  return (
    <a 
      href={`/api/export/categories?${query.toString()}`}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
    >
      <FileSpreadsheet className="w-4 h-4" /> Xuất Excel
    </a>
  )
}
