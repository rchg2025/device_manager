"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { writeLog } from "@/lib/system-log"

export async function updateMember(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") return { error: "Unauthorized" }

  const userId = formData.get("userId") as string
  if (!userId) return { error: "Missing ID" }

  const name = formData.get("name") as string
  const role = formData.get("role") as any
  const phone = formData.get("phone") as string
  const unitId = formData.get("unitId") as string
  const departmentId = formData.get("departmentId") as string
  const positionId = formData.get("positionId") as string

  const finalUnitId = session?.user?.role === "SUPERADMIN" ? (unitId || null) : session.user.unitId

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      role,
      phone,
      unitId: finalUnitId,
      departmentId: departmentId || null,
      positionId: positionId || null,
    }
  })
  await writeLog({
    userId: session.user.id,
    action: "UPDATE",
    entity: "member",
    entityId: userId,
    detail: `Cập nhật thông tin thành viên: ${name || userId}`
  })
  
  revalidatePath("/dashboard/members")
  return { success: true }
}

export async function deleteMember(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") return { error: "Unauthorized" }

  const userId = formData.get("userId") as string
  if (userId) {
    await prisma.user.delete({
      where: { id: userId }
    })
    await writeLog({
      userId: session.user.id,
      action: "DELETE",
      entity: "member",
      entityId: userId,
      detail: `Xóa thành viên: ${userId}`
    })
    revalidatePath("/dashboard/members")
    return { success: true }
  }
  return { error: "Missing ID" }
}

import bcrypt from "bcryptjs"

export async function createMember(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized")

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const role = formData.get("role") as any
  const phone = formData.get("phone") as string
  const unitId = formData.get("unitId") as string
  const departmentId = formData.get("departmentId") as string
  const positionId = formData.get("positionId") as string

  if (!email || !password) return { error: "Email và Mật khẩu là bắt buộc" }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) return { error: "Email này đã tồn tại trong hệ thống" }

  const hashedPassword = await bcrypt.hash(password, 10)

  const finalUnitId = session?.user?.role === "SUPERADMIN" ? (unitId || null) : session.user.unitId

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      phone,
      unitId: finalUnitId,
      departmentId: departmentId || null,
      positionId: positionId || null,
    }
  })
  await writeLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "member",
    entityId: null,
    detail: `Thêm thành viên mới: ${email}`
  })
  
  revalidatePath("/dashboard/members")
  return { success: true }
}

export async function importMembersExcel(users: any[]) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized")

  let successCount = 0
  let skipCount = 0
  const hashedPassword = await bcrypt.hash("123456", 10)

  for (const u of users) {
    if (!u.Email) continue
    
    const existing = await prisma.user.findUnique({ where: { email: u.Email } })
    if (existing) {
      skipCount++
      continue
    }

    try {
      await prisma.user.create({
        data: {
          email: u.Email,
          password: hashedPassword,
          name: u["Họ và tên"] || u.Name || "",
          phone: u["Số điện thoại"]?.toString() || u.Phone?.toString() || null,
          role: "MEMBER"
        }
      })
      successCount++
    } catch (err) {
      console.error("Error creating user from excel:", err)
    }
  }

  revalidatePath("/dashboard/members")
  return { successCount, skipCount }
}
