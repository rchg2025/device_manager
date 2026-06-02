"use server"
import { basePrisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendNewRegistrationEmailToAdmins } from "@/lib/email"

export async function getUnits() {
  return await basePrisma.unit.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
}

export async function getDepartmentsByUnit(unitId: string) {
  if (!unitId) return []
  return await basePrisma.department.findMany({
    where: { unitId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
}

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string
  const unitId = formData.get("unitId") as string
  const departmentId = formData.get("departmentId") as string

  if (!name || !email || !password || !unitId) {
    return { error: "Vui lòng điền đầy đủ các thông tin bắt buộc." }
  }

  if (password.length < 6) {
    return { error: "Mật khẩu phải có ít nhất 6 ký tự." }
  }

  try {
    // Kiểm tra email tồn tại
    const existingUser = await basePrisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "Email này đã được sử dụng." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Lấy thông tin đơn vị để gửi email
    const unit = await basePrisma.unit.findUnique({
      where: { id: unitId },
      select: { name: true }
    })

    const newUser = await basePrisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        unitId,
        departmentId: departmentId || null,
        role: "MEMBER",
        isActive: false // Chờ duyệt
      }
    })

    // Tìm các Admin/Manager của đơn vị và SuperAdmin
    const admins = await basePrisma.user.findMany({
      where: {
        OR: [
          { role: 'SUPERADMIN' },
          { unitId, role: { in: ['ADMIN', 'MANAGER'] } }
        ],
        isActive: true,
        email: { not: null }
      },
      select: { email: true, role: true }
    })

    const toEmails = admins.filter(a => a.role !== 'SUPERADMIN').map(a => a.email as string).filter(e => e)
    const bccEmails = admins.filter(a => a.role === 'SUPERADMIN').map(a => a.email as string).filter(e => e)
    
    if ((toEmails.length > 0 || bccEmails.length > 0) && unit) {
      await sendNewRegistrationEmailToAdmins(toEmails, bccEmails, name, email, unit.name)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Register Error:", error)
    return { error: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau." }
  }
}
