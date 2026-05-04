"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getEquipmentByBarcode(barcode: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Vui lòng đăng nhập" }

  // Search in Equipment
  const equipment = await prisma.equipment.findUnique({
    where: { id: barcode },
    select: { id: true, name: true, category: { select: { name: true } }, image: true }
  })
  if (equipment) return { type: 'equipment', data: equipment }

  // Search in ClassroomEquipment
  const classroomEq = await prisma.classroomEquipment.findUnique({
    where: { id: barcode },
    select: { id: true, name: true, room: { select: { name: true } }, area: { select: { name: true } }, image: true }
  })
  if (classroomEq) return { type: 'classroom-equipment', data: classroomEq }

  return { error: "Không tìm thấy thiết bị với mã này" }
}

export async function createInventorySession(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Vui lòng đăng nhập" }
  if (session.user.role === "MEMBER") return { error: "Không có quyền thực hiện" }

  const name = formData.get("name") as string
  if (!name) return { error: "Vui lòng nhập tên đợt kiểm kê" }

  try {
    const newSession = await prisma.inventorySession.create({
      data: {
        name,
        creatorId: session.user.id
      }
    })
    revalidatePath("/dashboard/inventory")
    return { success: true, id: newSession.id }
  } catch (error: any) {
    return { error: "Lỗi tạo đợt kiểm kê: " + error.message }
  }
}

export async function completeInventorySession(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Vui lòng đăng nhập" }
  if (session.user.role === "MEMBER") return { error: "Không có quyền thực hiện" }

  try {
    await prisma.inventorySession.update({
      where: { id },
      data: { status: "COMPLETED" }
    })
  } catch (error: any) {
    return { error: "Lỗi hoàn tất đợt kiểm kê: " + error.message }
  }
  revalidatePath("/dashboard/inventory")
  redirect("/dashboard/inventory")
}

export async function deleteInventorySession(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Vui lòng đăng nhập" }
  if (session.user.role !== "ADMIN") return { error: "Chỉ Quản trị viên mới được xóa đợt kiểm kê" }

  try {
    await prisma.inventorySession.delete({
      where: { id }
    })
    revalidatePath("/dashboard/inventory")
    return { success: true }
  } catch (error: any) {
    return { error: "Lỗi xóa đợt kiểm kê: " + error.message }
  }
}

export async function saveInventoryRecord(data: {
  sessionId?: string,
  equipmentId?: string,
  classroomEqId?: string,
  location?: string,
  note?: string,
  status: string
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Vui lòng đăng nhập" }

  try {
    // Determine active session if sessionId is not provided
    let activeSessionId = data.sessionId;
    if (!activeSessionId) {
      const activeSession = await prisma.inventorySession.findFirst({
        where: { status: "IN_PROGRESS" },
        orderBy: { createdAt: 'desc' }
      });
      if (activeSession) {
        activeSessionId = activeSession.id;
      }
    }

    await prisma.inventoryRecord.create({
      data: {
        sessionId: activeSessionId,
        equipmentId: data.equipmentId,
        classroomEqId: data.classroomEqId,
        scannerId: session.user.id,
        location: data.location || "",
        note: data.note || "",
        status: data.status
      }
    })
    
    revalidatePath("/dashboard/inventory")
    return { success: true }
  } catch (error: any) {
    return { error: "Lỗi ghi nhận kiểm kê: " + error.message }
  }
}

export async function deleteInventoryRecord(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Vui lòng đăng nhập" }
  if (session.user.role === "MEMBER") return { error: "Không có quyền thực hiện" }

  try {
    await prisma.inventoryRecord.delete({
      where: { id }
    })
    revalidatePath("/dashboard/inventory")
    return { success: true }
  } catch (error: any) {
    return { error: "Lỗi xóa bản ghi: " + error.message }
  }
}
