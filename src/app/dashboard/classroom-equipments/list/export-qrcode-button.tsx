"use client"

import { QrCode } from "lucide-react"

export default function ExportQRCodeButton({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const query = new URLSearchParams()
  if (searchParams.room) query.set("room", searchParams.room)
  if (searchParams.manager) query.set("manager", searchParams.manager)
  if (searchParams.equipment) query.set("equipment", searchParams.equipment)

  return (
    <a 
      href={`/api/export/classroom-equipments-qrcode?${query.toString()}`}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
    >
      <QrCode className="w-4 h-4" /> Xuất QR Code
    </a>
  )
}
