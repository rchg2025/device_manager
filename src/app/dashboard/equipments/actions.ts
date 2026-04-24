"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createEquipment(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const categoryId = formData.get("categoryId") as string
  let barcode = formData.get("barcode") as string || null
  const image = formData.get("image") as string || null
  const totalQty = parseInt(formData.get("totalQty") as string || "0")

  if (!name || !categoryId || totalQty < 0) return { error: "Dữ liệu không hợp lệ" }

  if (!barcode) {
    barcode = `EQ-${Date.now()}`
  }

  try {
    await prisma.equipment.create({
      data: {
        name,
        categoryId,
        barcode,
        image,
        totalQty,
        availableQty: totalQty
      }
    })
    revalidatePath("/dashboard/equipments")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi thêm thiết bị (có thể trùng mã vạch)" }
  }
}

export async function deleteEquipment(id: string) {
  try {
    const session = await auth()
    if (session?.user?.role === "MEMBER" || !session?.user?.role) {
      return { error: "Bạn không có quyền thực hiện thao tác này" }
    }

    await prisma.$transaction([
      prisma.borrowRequest.deleteMany({ where: { equipmentId: id } }),
      prisma.equipment.delete({ where: { id } })
    ])
    
    revalidatePath("/dashboard/equipments")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Lỗi khi xóa thiết bị" }
  }
}

export async function updateEquipment(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const categoryId = formData.get("categoryId") as string
  const barcode = formData.get("barcode") as string || null
  const image = formData.get("image") as string || null
  const totalQty = parseInt(formData.get("totalQty") as string || "0")

  if (!id || !name || !categoryId || totalQty < 0) return { error: "Dữ liệu không hợp lệ" }

  try {
    const existing = await prisma.equipment.findUnique({ where: { id } })
    if (!existing) return { error: "Thiết bị không tồn tại" }
    
    // We need to adjust availableQty based on the new totalQty
    const diff = totalQty - existing.totalQty
    const newAvailableQty = existing.availableQty + diff
    
    if (newAvailableQty < 0) return { error: "Số lượng tổng không được nhỏ hơn số lượng thiết bị đang được mượn" }

    await prisma.equipment.update({
      where: { id },
      data: {
        name,
        categoryId,
        barcode,
        image,
        totalQty,
        availableQty: newAvailableQty
      }
    })
    revalidatePath("/dashboard/equipments")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi cập nhật thiết bị" }
  }
}
