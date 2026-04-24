import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import SettingsForm from "./settings-form"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const settings = await prisma.setting.findMany({
    where: { 
      OR: [
        { key: { startsWith: "SMTP_" } },
        { key: { startsWith: "DRIVE_" } }
      ]
    }
  })
  
  const systemSettings: Record<string, string> = {}
  settings.forEach(s => {
    systemSettings[s.key] = s.value
  })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Cấu hình Hệ thống</h2>
      <SettingsForm settings={systemSettings} />
    </div>
  )
}
