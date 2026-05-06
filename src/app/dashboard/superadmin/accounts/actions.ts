"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"

export async function createSuperadminAccount(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const phone = formData.get("phone") as string
  const role = formData.get("role") as any // SUPERADMIN or SUPERVISOR
  const supervisedUnitIds = formData.getAll("supervisedUnitIds") as string[]

  if (!name || !email || !password || !role) return { error: "Vui lòng nhập đủ thông tin" }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "Email đã tồn tại" }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        supervisedUnits: role === "SUPERVISOR" ? {
          connect: supervisedUnitIds.map(id => ({ id }))
        } : undefined
      }
    })
    revalidatePath("/dashboard/superadmin/accounts")
    return { success: true }
  } catch (error) {
    console.error("Create account error:", error)
    return { error: "Lỗi khi tạo tài khoản" }
  }
}

export async function updateSuperadminAccount(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized")

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const role = formData.get("role") as any
  const supervisedUnitIds = formData.getAll("supervisedUnitIds") as string[]
  const password = formData.get("password") as string

  try {
    const data: any = { name, phone, role }
    
    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    if (role === "SUPERVISOR") {
      data.supervisedUnits = {
        set: supervisedUnitIds.map(uid => ({ id: uid }))
      }
    } else {
      data.supervisedUnits = { set: [] }
    }

    await prisma.user.update({
      where: { id },
      data
    })
    revalidatePath("/dashboard/superadmin/accounts")
    return { success: true }
  } catch (error) {
    console.error("Update account error:", error)
    return { error: "Lỗi khi cập nhật tài khoản" }
  }
}

export async function deleteSuperadminAccount(id: string) {
  const session = await auth()
  if (session?.user?.role !== "SUPERADMIN") throw new Error("Unauthorized")

  if (id === session.user.id) return { error: "Không thể xóa tài khoản của chính mình" }

  try {
    await prisma.user.delete({ where: { id } })
    revalidatePath("/dashboard/superadmin/accounts")
    return { success: true }
  } catch (error) {
    console.error("Delete account error:", error)
    return { error: "Lỗi khi xóa tài khoản" }
  }
}
