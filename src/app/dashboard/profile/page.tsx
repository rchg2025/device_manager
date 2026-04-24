import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileForm from "./profile-form"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      email: true, 
      name: true, 
      role: true,
      unit: { select: { name: true } },
      position: { select: { name: true } }
    }
  })

  if (!user) redirect("/login")

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Quản lý Tài khoản</h2>
      <ProfileForm user={user} />
    </div>
  )
}
