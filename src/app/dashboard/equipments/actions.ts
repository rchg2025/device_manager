"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createEquipment(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const categoryId = formData.get("categoryId") as string
  const barcode = formData.get("barcode") as string || null
  const image = formData.get("image") as string || null
  const totalQty = parseInt(formData.get("totalQty") as string || "0")

  if (!name || !categoryId || totalQty < 0) return { error: "Dữ liệu không hợp lệ" }

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
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  try {
    await prisma.equipment.delete({
      where: { id }
    })
    revalidatePath("/dashboard/equipments")
    return { success: true }
  } catch (error) {
    return { error: "Không thể xóa thiết bị đang được mượn" }
  }
}
