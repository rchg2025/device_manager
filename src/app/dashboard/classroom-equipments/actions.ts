// @ts-nocheck
"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { writeLog } from "@/lib/system-log"
import { uploadImageToDrive } from "@/lib/gdrive"

export async function createClassroomEquipment(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const areaId = formData.get("areaId") as string
  const roomId = formData.get("roomId") as string
  const categoryId = formData.get("categoryId") as string
  const quantity = parseInt(formData.get("quantity") as string)
  const imageFile = formData.get("image") as File | null
  const configIds = formData.getAll("configIds") as string[]

  if (!name || !areaId || !roomId || !categoryId || isNaN(quantity) || quantity < 1) {
    return { error: "Vui lòng nhập đầy đủ thông tin hợp lệ" }
  }

  // No manager restriction on classroomEqCategory (they don't have managerId field)

  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await uploadImageToDrive(imageFile)
    } catch (e: any) {
      return { error: e.message || "Lỗi tải ảnh lên Google Drive" }
    }
  }

  try {
    await prisma.classroomEquipment.create({
      data: {
        name,
        areaId,
        roomId,
        categoryId,
        quantity,
        image: imageUrl,
        creatorName: session?.user?.name || "Unknown",
        configs: {
          connect: configIds.map(id => ({ id }))
        }
      }
    })
    await writeLog({
      userId: session.user.id,
      action: "CREATE",
      entity: "classroom_equipment",
      entityId: null,
      detail: `Thêm thiết bị phòng học: ${name}`
    })
    revalidatePath("/dashboard/classroom-equipments")
    return { success: true }
  } catch (error: any) {
    console.error("Create Classroom Equipment Error:", error)
    return { error: "Lỗi khi thêm thiết bị phòng học" }
  }
}

export async function updateClassroomEquipment(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const areaId = formData.get("areaId") as string
  const roomId = formData.get("roomId") as string
  const categoryId = formData.get("categoryId") as string
  const quantity = parseInt(formData.get("quantity") as string)
  const imageFile = formData.get("image") as File | null
  const configIds = formData.getAll("configIds") as string[]
  
  let imageUrl = formData.get("existingImage") as string || null

  if (!id || !name || !areaId || !roomId || !categoryId || isNaN(quantity) || quantity < 1) {
    return { error: "Vui lòng nhập đầy đủ thông tin hợp lệ" }
  }

  if (session.user.role === "MANAGER") {
    const existing = await prisma.classroomEquipment.findUnique({ where: { id }, include: { room: true } })
    if (existing?.room?.managerId && existing.room.managerId !== session.user.id) {
      return { error: "Bạn không có quyền sửa thiết bị này" }
    }
  }

  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await uploadImageToDrive(imageFile)
    } catch (e: any) {
      return { error: e.message || "Lỗi tải ảnh lên Google Drive" }
    }
  }

  try {
    // First, clear existing connections for configs, then connect new ones
    await prisma.classroomEquipment.update({
      where: { id },
      data: {
        name,
        areaId,
        roomId,
        categoryId,
        quantity,
        image: imageUrl,
        updatedByName: session?.user?.name || "Unknown",
        configs: {
          set: [], // clear existing
          connect: configIds.map(id => ({ id })) // add new
        }
      }
    })
    await writeLog({
      userId: session.user.id,
      action: "UPDATE",
      entity: "classroom_equipment",
      entityId: id,
      detail: `Cập nhật thiết bị phòng học: ${name}`
    })
    revalidatePath("/dashboard/classroom-equipments")
    return { success: true }
  } catch (error: any) {
    console.error("Update Classroom Equipment Error:", error)
    return { error: "Lỗi khi cập nhật thiết bị phòng học" }
  }
}

export async function deleteClassroomEquipment(id: string) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  try {
    if (session?.user?.role === "MANAGER") {
      const existing = await prisma.classroomEquipment.findUnique({ where: { id }, include: { room: true } })
      if (existing?.room?.managerId && existing.room.managerId !== session.user.id) {
        return { error: "Bạn không có quyền xóa thiết bị này" }
      }
    }

    const maintenances = await prisma.maintenance.count({
      where: { classroomEqId: id }
    })
    if (maintenances > 0) {
      return { error: "Không thể xóa thiết bị đang có lịch sử bảo trì. Vui lòng xóa lịch sử bảo trì trước." }
    }

    await prisma.classroomEquipment.delete({
      where: { id }
    })
    await writeLog({
      userId: session.user.id,
      action: "DELETE",
      entity: "classroom_equipment",
      entityId: id,
      detail: `Xóa thiết bị phòng học: ${id}`
    })
    revalidatePath("/dashboard/classroom-equipments")
    return { success: true }
  } catch (error) {
    console.error("Delete Classroom Equipment Error:", error)
    return { error: "Đã xảy ra lỗi khi xóa thiết bị" }
  }
}

export async function importClassroomEquipments(data: any[]) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") return { error: "Unauthorized" }

  let successCount = 0
  const errors: string[] = []
  
  const areas = await prisma.area.findMany()
  const rooms = await prisma.room.findMany({
    where: session?.user?.role === "MANAGER" ? { managerId: session.user.id } : undefined
  })
  const categories = await prisma.classroomEqCategory.findMany()
  const configs = await prisma.deviceConfig.findMany()

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNum = i + 2 // header is row 1
    
    const name = row["Tên thiết bị"]?.toString().trim()
    const areaName = row["Khu vực"]?.toString().trim()
    const roomName = row["Phòng học"]?.toString().trim()
    const categoryName = row["Danh mục"]?.toString().trim()
    const configNamesStr = row["Cấu hình"]?.toString() || ""
    const quantity = parseInt(row["Số lượng"]) || 1

    if (!name || !areaName || !roomName || !categoryName) {
      errors.push(`Dòng ${rowNum}: Thiếu thông tin bắt buộc (Tên, Khu vực, Phòng, Danh mục)`)
      continue
    }

    const area = areas.find(a => a.name.toLowerCase() === areaName.toLowerCase())
    if (!area) {
      errors.push(`Dòng ${rowNum}: Khu vực "${areaName}" không tồn tại`)
      continue
    }

    const room = rooms.find(r => r.name.toLowerCase() === roomName.toLowerCase() && r.areaId === area.id)
    if (!room) {
      errors.push(`Dòng ${rowNum}: Phòng "${roomName}" không tồn tại trong Khu vực "${areaName}" hoặc bạn không có quyền quản lý`)
      continue
    }

    const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())
    if (!category) {
      errors.push(`Dòng ${rowNum}: Danh mục "${categoryName}" không tồn tại`)
      continue
    }

    const configNames = configNamesStr.split(",").map((c: string) => c.trim()).filter(Boolean)
    const matchedConfigs = configs.filter(c => configNames.some((cn: string) => c.name.toLowerCase() === cn.toLowerCase()))
    
    try {
      await prisma.classroomEquipment.create({
        data: {
          name,
          areaId: area.id,
          roomId: room.id,
          categoryId: category.id,
          quantity,
          creatorName: session?.user?.name || "Unknown",
          configs: {
            connect: matchedConfigs.map(c => ({ id: c.id }))
          }
        }
      })
      successCount++
    } catch (e: any) {
      errors.push(`Dòng ${rowNum}: Lỗi hệ thống khi thêm thiết bị`)
    }
  }

  if (successCount > 0) {
    await writeLog({
      userId: session.user.id,
      action: "CREATE",
      entity: "classroom_equipment",
      entityId: null,
      detail: `Import Excel: Thêm ${successCount} thiết bị phòng học`
    })
    revalidatePath("/dashboard/classroom-equipments")
  }

  return { results: { success: successCount, errors } }
}
