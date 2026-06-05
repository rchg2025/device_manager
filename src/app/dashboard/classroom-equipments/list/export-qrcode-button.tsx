"use client"

import { QrCode } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function ExportQRCodeButton() {
  const searchParams = useSearchParams()
  const query = new URLSearchParams()
  if (searchParams.get("room")) query.set("roomName", searchParams.get("room")!)
  if (searchParams.get("manager")) query.set("managerName", searchParams.get("manager")!)
  if (searchParams.get("equipment")) query.set("equipmentName", searchParams.get("equipment")!)

  return (
    <a 
      href={`/api/export/classroom-equipments-qrcode?${query.toString()}`}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
    >
      <QrCode className="w-4 h-4" /> Xuất QR Code
    </a>
  )
}
