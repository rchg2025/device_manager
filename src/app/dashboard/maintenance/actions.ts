"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { writeLog } from "@/lib/system-log"

export async function createMaintenance(formData: FormData) {
  const session = await auth()
  if (!session?.user?.role || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER" && session.user.role !== "SUPERADMIN")) {
    return { error: "Bạn không có quyền thực hiện thao tác này" }
  }

  const equipmentId = formData.get("equipmentId") as string | null
  const classroomEqId = formData.get("classroomEqId") as string | null
  let description = formData.get("description") as string
  const liquidationReason = formData.get("liquidationReason") as string
  const cost = parseFloat(formData.get("cost") as string || "0")
  const status = formData.get("status") as string
  const dateStr = formData.get("date") as string
  const quantity = parseInt(formData.get("quantity") as string || "1", 10)

  if ((!equipmentId && !classroomEqId) || !description || quantity < 1) return { error: "Thiếu thông tin bắt buộc" }

  if (session.user.role === "MANAGER") {
    if (equipmentId) {
      const eq = await prisma.equipment.findUnique({ where: { id: equipmentId }, include: { category: true } })
      if (eq?.category?.managerId && eq.category.managerId !== session.user.id) {
        return { error: "Bạn không có quyền bảo trì thiết bị này" }
      }
    } else if (classroomEqId) {
      const eq = await prisma.classroomEquipment.findUnique({ where: { id: classroomEqId }, include: { category: true } })
      // ClassroomEqCategory doesn't have managerId
    }
  }

  const date = dateStr ? new Date(dateStr) : new Date()

  // Kiểm tra số lượng
  if (equipmentId) {
    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } })
    if (!equipment || equipment.availableQty < quantity) {
      return { error: "Số lượng sẵn sàng không đủ" }
    }
  } else if (classroomEqId) {
    const equipment = await prisma.classroomEquipment.findUnique({ where: { id: classroomEqId } })
    if (!equipment || equipment.quantity < quantity) {
      return { error: "Số lượng không đủ" }
    }
  }

  if (status === "LIQUIDATED" && liquidationReason) {
    description = `${description}\n\n[Thanh lý] Số văn bản / Lý do: ${liquidationReason}`
  }

  await prisma.$transaction(async (tx) => {
    await tx.maintenance.create({
      data: {
        equipmentId: equipmentId || undefined,
        classroomEqId: classroomEqId || undefined,
        description,
        cost,
        status,
        quantity,
        date,
        handlerName: session?.user?.name || session?.user?.email || "Unknown"
      }
    })
    await writeLog({
      userId: session.user.id,
      action: "CREATE",
      entity: "maintenance",
      entityId: null,
      detail: `Tạo ghi nhận bảo trì cho thiết bị ${equipmentId || classroomEqId} (Trạng thái: ${status}, SL: ${quantity})`
    })

    // Giảm số lượng sẵn sàng nếu không phải hoàn thành ngay lập tức
    if (status !== "COMPLETED") {
      if (equipmentId) {
        let updateData: any = { availableQty: { decrement: quantity } }
        if (status === "LIQUIDATED") {
          updateData.totalQty = { decrement: quantity }
        }
        await tx.equipment.update({
          where: { id: equipmentId },
          data: updateData
        })
      } else if (classroomEqId) {
        await tx.classroomEquipment.update({
          where: { id: classroomEqId },
          data: { quantity: { decrement: quantity } }
        })
      }
    }
  })

  revalidatePath("/dashboard/maintenance")
  revalidatePath("/dashboard/equipments")
  revalidatePath("/dashboard/classroom-equipments")
  return { success: true }
}

export async function updateMaintenanceStatus(id: string, status: string, liquidationReason?: string) {
  const session = await auth()
  if (!session?.user?.role || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER" && session.user.role !== "SUPERADMIN")) {
    return { error: "Bạn không có quyền thực hiện thao tác này" }
  }

  const existing = await prisma.maintenance.findUnique({ 
    where: { id },
    include: { equipment: { include: { category: true } }, classroomEq: { include: { category: true } } }
  })
  if (!existing) return

  if (session.user.role === "MANAGER") {
    if (existing.equipment?.category?.managerId && existing.equipment.category.managerId !== session.user.id) {
      throw new Error("Bạn không có quyền cập nhật bảo trì này")
    }
    // ClassroomEqCategory doesn't have managerId
  }

  await prisma.$transaction(async (tx) => {
    let newDescription = existing.description;
    if (status === "LIQUIDATED" && liquidationReason && existing.status !== "LIQUIDATED") {
      newDescription = `${newDescription}\n\n[Thanh lý] Số văn bản / Lý do: ${liquidationReason}`;
    }

    await tx.maintenance.update({
      where: { id },
      data: { 
        status,
        description: newDescription,
        handlerName: session?.user?.name || session?.user?.email || "Unknown" 
      }
    })
    await writeLog({
      userId: session.user.id,
      action: "UPDATE",
      entity: "maintenance",
      entityId: id,
      detail: `Cập nhật trạng thái bảo trì ${id} thành ${status}`
    })

    if (existing.equipmentId) {
      let dTotal = 0;
      let dAvailable = 0;

      // Undo existing status effects
      if (existing.status === 'LIQUIDATED') {
        dTotal += existing.quantity;
        dAvailable += existing.quantity;
      } else if (existing.status !== 'COMPLETED') {
        dAvailable += existing.quantity;
      }

      // Apply new status effects
      if (status === 'LIQUIDATED') {
        dTotal -= existing.quantity;
        dAvailable -= existing.quantity;
      } else if (status !== 'COMPLETED') {
        dAvailable -= existing.quantity;
      }

      if (dTotal !== 0 || dAvailable !== 0) {
        let updateData: any = {};
        if (dTotal > 0) updateData.totalQty = { increment: dTotal };
        if (dTotal < 0) updateData.totalQty = { decrement: -dTotal };
        if (dAvailable > 0) updateData.availableQty = { increment: dAvailable };
        if (dAvailable < 0) updateData.availableQty = { decrement: -dAvailable };

        await tx.equipment.update({
          where: { id: existing.equipmentId },
          data: updateData
        });
      }
    } else if (existing.classroomEqId) {
      // Đối với thiết bị phòng học, quantity đóng vai trò là số lượng hiện diện trong phòng
      if (existing.status !== "COMPLETED" && status === "COMPLETED") {
        await tx.classroomEquipment.update({
          where: { id: existing.classroomEqId },
          data: { quantity: { increment: existing.quantity } }
        })
      }
      else if (existing.status === "COMPLETED" && status !== "COMPLETED") {
        await tx.classroomEquipment.update({
          where: { id: existing.classroomEqId },
          data: { quantity: { decrement: existing.quantity } }
        })
      }
    }
  })

  revalidatePath("/dashboard/maintenance")
  revalidatePath("/dashboard/equipments")
  revalidatePath("/dashboard/classroom-equipments")
  return { success: true }
}

export async function deleteMaintenance(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
    return { error: "Chỉ Quản trị viên mới có quyền xóa lịch sử bảo trì." }
  }
  const existing = await prisma.maintenance.findUnique({ where: { id } })
  if (!existing) return

  await prisma.$transaction(async (tx) => {
    await tx.maintenance.delete({ where: { id } })
    await writeLog({
      userId: session.user.id,
      action: "DELETE",
      entity: "maintenance",
      entityId: id,
      detail: `Xóa ghi nhận bảo trì: ${id}`
    })

    // Nếu xoá bản ghi bảo trì đang không ở trạng thái COMPLETED, trả lại số lượng
    if (existing.status !== "COMPLETED") {
      if (existing.equipmentId) {
        let updateData: any = { availableQty: { increment: existing.quantity } }
        if (existing.status === "LIQUIDATED") {
          updateData.totalQty = { increment: existing.quantity }
        }
        await tx.equipment.update({
          where: { id: existing.equipmentId },
          data: updateData
        })
      } else if (existing.classroomEqId) {
        await tx.classroomEquipment.update({
          where: { id: existing.classroomEqId },
          data: { quantity: { increment: existing.quantity } }
        })
      }
    }
  })

  revalidatePath("/dashboard/maintenance")
}
