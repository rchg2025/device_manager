"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { uploadImageToDrive } from "@/lib/gdrive"

export async function createEquipment(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const categoryId = formData.get("categoryId") as string
  let barcode = formData.get("barcode") as string || null
  const imageFile = formData.get("image") as File | null
  const totalQty = parseInt(formData.get("totalQty") as string || "0")

  if (!name || !categoryId || totalQty < 0) return { error: "Dữ liệu không hợp lệ" }

  if (session.user.role === "MANAGER") {
    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (category?.managerId && category.managerId !== session.user.id) {
      return { error: "Bạn không có quyền thêm thiết bị vào danh mục này" }
    }
  }

  if (!barcode) {
    barcode = `EQ-${Date.now()}`
  }

  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await uploadImageToDrive(imageFile)
    } catch (e: any) {
      return { error: e.message || "Lỗi tải ảnh lên Google Drive" }
    }
  }

  try {
    await prisma.equipment.create({
      data: {
        name,
        categoryId,
        barcode,
        image: imageUrl,
        totalQty,
        availableQty: totalQty,
        creatorName: session?.user?.name || session?.user?.email || "Unknown"
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

    const equipment = await prisma.equipment.findUnique({ where: { id }, include: { category: true } })
    if (!equipment) return { error: "Không tìm thấy thiết bị" }

    if (session.user.role === "MANAGER") {
      if (equipment.category?.managerId && equipment.category.managerId !== session.user.id) {
        return { error: "Bạn không có quyền xóa thiết bị này" }
      }
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
  const imageFile = formData.get("image") as File | null
  let imageUrl = formData.get("existingImage") as string || null
  const totalQty = parseInt(formData.get("totalQty") as string || "0")

  if (!id || !name || !categoryId || totalQty < 0) return { error: "Dữ liệu không hợp lệ" }

  try {
    const existing = await prisma.equipment.findUnique({ where: { id }, include: { category: true } })
    if (!existing) return { error: "Không tìm thấy thiết bị" }

    if (session.user.role === "MANAGER") {
      if (existing.category?.managerId && existing.category.managerId !== session.user.id) {
        return { error: "Bạn không có quyền sửa thiết bị này" }
      }
      
      const newCategory = await prisma.category.findUnique({ where: { id: categoryId } })
      if (newCategory?.managerId && newCategory.managerId !== session.user.id) {
        return { error: "Bạn không có quyền chuyển thiết bị sang danh mục này" }
      }
    }

    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadImageToDrive(imageFile)
      } catch (e: any) {
        return { error: e.message || "Lỗi tải ảnh lên Google Drive" }
      }
    }

    const qtyDiff = totalQty - existing.totalQty
    const newAvailableQty = existing.availableQty + qtyDiff
    if (newAvailableQty < 0) return { error: "Số lượng tổng không thể nhỏ hơn số lượng đã cho mượn" }

    await prisma.equipment.update({
      where: { id },
      data: {
        name,
        categoryId,
        barcode: barcode || existing.barcode,
        image: imageUrl,
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
