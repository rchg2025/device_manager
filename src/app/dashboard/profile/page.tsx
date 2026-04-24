import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileForm from "./profile-form"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, role: true }
  })

  if (!user) redirect("/login")

  let smtpSettings: Record<string, string> = {}
  if (user.role === "ADMIN") {
    const settings = await prisma.setting.findMany({
      where: { key: { startsWith: "SMTP_" } }
    })
    settings.forEach(s => {
      smtpSettings[s.key] = s.value
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Quản lý Tài khoản</h2>
      <ProfileForm 
        user={user} 
        smtpSettings={smtpSettings} 
        isAdmin={user.role === "ADMIN"} 
      />
    </div>
  )
}
