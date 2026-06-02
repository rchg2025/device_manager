"use server"
import { auth } from "@/auth"
import { writeLog } from "@/lib/system-log"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { testDriveConnection, uploadImageToDrive } from "@/lib/gdrive"

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
    const avatar = formData.get("avatar") as File | null
    if (avatar && avatar.size > 0) {
      try {
        const imageUrl = await uploadImageToDrive(avatar)
        if (imageUrl) {
          dataToUpdate.image = imageUrl
        }
      } catch (uploadError: any) {
        return { error: uploadError.message || "Lỗi khi tải ảnh lên Google Drive" }
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate
    })
    await writeLog({
      userId: session.user.id,
      action: "UPDATE",
      entity: "profile",
      entityId: session.user.id,
      detail: `Cập nhật thông tin cá nhân`
    })
    revalidatePath("/dashboard/profile")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi cập nhật thông tin cá nhân" }
  }
}

export async function updateSmtpSettings(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") return { error: "Không có quyền thực hiện thao tác này" }

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
      const existing = await prisma.setting.findFirst({
        where: { key: setting.key }
      })
      if (existing) {
        await prisma.setting.updateMany({
          where: { key: setting.key },
          data: { value: setting.value }
        })
      } else {
        await prisma.setting.create({
          data: { key: setting.key, value: setting.value }
        })
      }
    }
    await writeLog({
      userId: session.user.id,
      action: "UPDATE",
      entity: "system_config",
      entityId: "smtp",
      detail: `Cập nhật cấu hình email (SMTP)`
    })

    revalidatePath("/dashboard/profile")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi lưu cấu hình SMTP" }
  }
}

export async function updateDriveSettings(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") return { error: "Không có quyền thực hiện thao tác này" }

  const email = formData.get("email") as string
  const privateKey = formData.get("privateKey") as string
  const folderId = formData.get("folderId") as string

  try {
    const settings = [
      { key: "DRIVE_CLIENT_EMAIL", value: email },
      { key: "DRIVE_PRIVATE_KEY", value: privateKey },
      { key: "DRIVE_FOLDER_ID", value: folderId },
    ]

    for (const setting of settings) {
      const existing = await prisma.setting.findFirst({
        where: { key: setting.key }
      })
      if (existing) {
        await prisma.setting.updateMany({
          where: { key: setting.key },
          data: { value: setting.value }
        })
      } else {
        await prisma.setting.create({
          data: { key: setting.key, value: setting.value }
        })
      }
    }

    await writeLog({
      userId: session.user.id,
      action: "UPDATE",
      entity: "system_config",
      entityId: "gdrive",
      detail: `Cập nhật cấu hình Google Drive`
    })
    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi lưu cấu hình Google Drive" }
  }
}

export async function testDriveConnectionAction(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") return { success: false, message: "Không có quyền thực hiện thao tác này" }

  const email = formData.get("email") as string
  const privateKey = formData.get("privateKey") as string
  const folderId = formData.get("folderId") as string

  if (!email || !privateKey || !folderId) {
    return { success: false, message: "Vui lòng điền đầy đủ thông tin để kiểm tra." }
  }

  return await testDriveConnection(email, privateKey, folderId)
}
