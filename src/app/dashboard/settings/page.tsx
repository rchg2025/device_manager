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
    where: { key: { startsWith: "SMTP_" } }
  })
  
  const smtpSettings: Record<string, string> = {}
  settings.forEach(s => {
    smtpSettings[s.key] = s.value
  })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Cấu hình Hệ thống</h2>
      <SettingsForm smtpSettings={smtpSettings} />
    </div>
  )
}
