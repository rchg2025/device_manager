"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Bạn chưa đăng nhập" }

  const name = formData.get("name") as string
  const password = formData.get("password") as string

  if (!name) return { error: "Tên không được để trống" }

  const dataToUpdate: any = { name }

  if (password && password.trim().length > 0) {
    if (password.length < 6) return { error: "Mật khẩu phải có ít nhất 6 ký tự" }
    dataToUpdate.password = await bcrypt.hash(password, 10)
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate
    })
    revalidatePath("/dashboard/profile")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi cập nhật thông tin cá nhân" }
  }
}

export async function updateSmtpSettings(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return { error: "Không có quyền thực hiện thao tác này" }

  const host = formData.get("host") as string
  const port = formData.get("port") as string
  const user = formData.get("user") as string
  const pass = formData.get("pass") as string
  const from = formData.get("from") as string

  try {
    const settings = [
      { key: "SMTP_HOST", value: host },
      { key: "SMTP_PORT", value: port },
      { key: "SMTP_USER", value: user },
      { key: "SMTP_PASS", value: pass },
      { key: "SMTP_FROM", value: from },
    ]

    for (const setting of settings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value }
      })
    }

    revalidatePath("/dashboard/profile")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi lưu cấu hình SMTP" }
  }
}
