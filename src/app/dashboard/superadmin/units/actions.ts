"use server"

import { basePrisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath, revalidateTag } from "next/cache"

export async function createUnit(name: string) {
  const session = await auth()
  if (session?.user?.role !== "SUPERADMIN") return { error: "Không có quyền" }

  try {
    await basePrisma.unit.create({
      data: { name }
    })
    revalidatePath("/dashboard/superadmin/units")
    return { success: true }
  } catch (error) {
    return { error: "Không thể tạo đơn vị. Tên này có thể đã tồn tại." }
  }
}

export async function deleteUnit(id: string) {
  const session = await auth()
  if (session?.user?.role !== "SUPERADMIN") return { error: "Không có quyền" }

  try {
    await basePrisma.unit.delete({
      where: { id }
    })
    revalidatePath("/dashboard/superadmin/units")
    return { success: true }
  } catch (error) {
    return { error: "Không thể xóa đơn vị. Có thể đơn vị này đang chứa dữ liệu." }
  }
}

export async function updateUnit(id: string, name: string) {
  const session = await auth()
  if (session?.user?.role !== "SUPERADMIN") return { error: "Không có quyền" }

  try {
    await basePrisma.unit.update({
      where: { id },
      data: { name }
    })
    revalidatePath("/dashboard/superadmin/units")
    return { success: true }
  } catch (error) {
    return { error: "Không thể cập nhật. Tên có thể đã tồn tại." }
  }
}

export async function toggleUnitStatus(id: string, currentStatus: boolean) {
  const session = await auth()
  if (session?.user?.role !== "SUPERADMIN") return { error: "Không có quyền" }

  try {
    await basePrisma.unit.update({
      where: { id },
      data: { isActive: !currentStatus }
    })
    revalidatePath("/dashboard/superadmin/units")
    revalidateTag("units")
    return { success: true }
  } catch (error) {
    return { error: "Không thể cập nhật trạng thái." }
  }
}
