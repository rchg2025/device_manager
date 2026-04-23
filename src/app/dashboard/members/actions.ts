"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateMember(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  const userId = formData.get("userId") as string
  if (!userId) return

  const name = formData.get("name") as string
  const role = formData.get("role") as any
  const phone = formData.get("phone") as string
  const unitId = formData.get("unitId") as string
  const positionId = formData.get("positionId") as string

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      role,
      phone,
      unitId: unitId || null,
      positionId: positionId || null,
    }
  })
  
  revalidatePath("/dashboard/members")
}

export async function deleteMember(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  const userId = formData.get("userId") as string
  if (userId) {
    await prisma.user.delete({
      where: { id: userId }
    })
    revalidatePath("/dashboard/members")
  }
}

import bcrypt from "bcryptjs"

export async function createMember(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const role = formData.get("role") as any
  const phone = formData.get("phone") as string
  const unitId = formData.get("unitId") as string
  const positionId = formData.get("positionId") as string

  if (!email || !password) return { error: "Email và Mật khẩu là bắt buộc" }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) return { error: "Email này đã tồn tại trong hệ thống" }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      phone,
      unitId: unitId || null,
      positionId: positionId || null,
    }
  })
  
  revalidatePath("/dashboard/members")
  return { success: true }
}
