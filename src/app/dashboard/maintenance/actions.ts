"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createMaintenance(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    throw new Error("Unauthorized")
  }

  const equipmentId = formData.get("equipmentId") as string
  const description = formData.get("description") as string
  const cost = parseFloat(formData.get("cost") as string || "0")
  const status = formData.get("status") as string
  const dateStr = formData.get("date") as string
  const quantity = parseInt(formData.get("quantity") as string || "1", 10)

  if (!equipmentId || !description || quantity < 1) return { error: "Thiếu thông tin bắt buộc" }

  const date = dateStr ? new Date(dateStr) : new Date()

  // Kiểm tra số lượng
  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } })
  if (!equipment || equipment.availableQty < quantity) {
    return { error: "Số lượng sẵn sàng không đủ" }
  }

  await prisma.$transaction(async (tx) => {
    await tx.maintenance.create({
      data: {
        equipmentId,
        description,
        cost,
        status,
        quantity,
        date
      }
    })

    // Giảm số lượng sẵn sàng nếu không phải hoàn thành ngay lập tức
    if (status !== "COMPLETED") {
      await tx.equipment.update({
        where: { id: equipmentId },
        data: { availableQty: { decrement: quantity } }
      })
    }
  })

  revalidatePath("/dashboard/maintenance")
  revalidatePath("/dashboard/equipments")
  return { success: true }
}

export async function updateMaintenanceStatus(id: string, status: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    throw new Error("Unauthorized")
  }

  const existing = await prisma.maintenance.findUnique({ where: { id } })
  if (!existing) return

  await prisma.$transaction(async (tx) => {
    await tx.maintenance.update({
      where: { id },
      data: { status }
    })

    // Nếu từ trạng thái khác chuyển sang COMPLETED, hoàn trả lại số lượng
    if (existing.status !== "COMPLETED" && status === "COMPLETED") {
      await tx.equipment.update({
        where: { id: existing.equipmentId },
        data: { availableQty: { increment: existing.quantity } }
      })
    }
    // Nếu từ COMPLETED chuyển về trạng thái khác (trừ khi xoá), phải giảm lại
    else if (existing.status === "COMPLETED" && status !== "COMPLETED") {
      // (Optional) Check if enough availableQty to decrement
      await tx.equipment.update({
        where: { id: existing.equipmentId },
        data: { availableQty: { decrement: existing.quantity } }
      })
    }
  })

  revalidatePath("/dashboard/maintenance")
}

export async function deleteMaintenance(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const existing = await prisma.maintenance.findUnique({ where: { id } })
  if (!existing) return

  await prisma.$transaction(async (tx) => {
    await tx.maintenance.delete({ where: { id } })

    // Nếu xoá bản ghi bảo trì đang không ở trạng thái COMPLETED, trả lại số lượng
    if (existing.status !== "COMPLETED") {
      await tx.equipment.update({
        where: { id: existing.equipmentId },
        data: { availableQty: { increment: existing.quantity } }
      })
    }
  })

  revalidatePath("/dashboard/maintenance")
}
