"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createClassroomEquipment(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const areaId = formData.get("areaId") as string
  const roomId = formData.get("roomId") as string
  const categoryId = formData.get("categoryId") as string
  const quantity = parseInt(formData.get("quantity") as string)
  const image = formData.get("image") as string || null
  const configIds = formData.getAll("configIds") as string[]

  if (!name || !areaId || !roomId || !categoryId || isNaN(quantity) || quantity < 1) {
    return { error: "Vui lòng nhập đầy đủ thông tin hợp lệ" }
  }

  try {
    await prisma.classroomEquipment.create({
      data: {
        name,
        areaId,
        roomId,
        categoryId,
        quantity,
        image,
        configs: {
          connect: configIds.map(id => ({ id }))
        }
      }
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
  const image = formData.get("image") as string || null
  const configIds = formData.getAll("configIds") as string[]

  if (!id || !name || !areaId || !roomId || !categoryId || isNaN(quantity) || quantity < 1) {
    return { error: "Vui lòng nhập đầy đủ thông tin hợp lệ" }
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
        image,
        configs: {
          set: [], // clear existing
          connect: configIds.map(id => ({ id })) // add new
        }
      }
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
    // Check if there are active maintenances
    const maintenances = await prisma.maintenance.count({
      where: { classroomEqId: id }
    })
    if (maintenances > 0) {
      return { error: "Không thể xóa thiết bị đang có lịch sử bảo trì. Vui lòng xóa lịch sử bảo trì trước." }
    }

    await prisma.classroomEquipment.delete({
      where: { id }
    })
    revalidatePath("/dashboard/classroom-equipments")
    return { success: true }
  } catch (error) {
    console.error("Delete Classroom Equipment Error:", error)
    return { error: "Đã xảy ra lỗi khi xóa thiết bị" }
  }
}
