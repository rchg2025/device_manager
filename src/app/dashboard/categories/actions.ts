"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createCategory(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const managerId = formData.get("managerId") as string || null
  if (!name) return { error: "Tên không được trống" }

  try {
    await prisma.category.create({
      data: { 
        name,
        managerId
      }
    })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi tạo danh mục thiết bị" }
  }
}

export async function deleteCategory(id: string) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  try {
    await prisma.category.delete({
      where: { id }
    })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) {
    return { error: "Không thể xóa danh mục đang có thiết bị" }
  }
}

export async function createUnit(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  if (!name) return { error: "Tên đơn vị không được trống" }

  try {
    await prisma.unit.create({
      data: { name }
    })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi tạo đơn vị (có thể bị trùng tên)" }
  }
}

export async function deleteUnit(id: string) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  try {
    await prisma.unit.delete({
      where: { id }
    })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) {
    return { error: "Không thể xóa đơn vị đang có thành viên" }
  }
}

export async function createPosition(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  if (!name) return { error: "Tên chức vụ không được trống" }

  try {
    await prisma.position.create({
      data: { name }
    })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi tạo chức vụ (có thể bị trùng tên)" }
  }
}

export async function deletePosition(id: string) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  try {
    await prisma.position.delete({
      where: { id }
    })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) {
    return { error: "Không thể xóa chức vụ đang có thành viên" }
  }
}

export async function updateCategory(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const managerId = formData.get("managerId") as string || null
  if (!id || !name) return { error: "Dữ liệu không hợp lệ" }

  try {
    await prisma.category.update({ 
      where: { id }, 
      data: { 
        name,
        managerId
      } 
    })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi cập nhật danh mục" }
  }
}

export async function updateUnit(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  if (!id || !name) return { error: "Dữ liệu không hợp lệ" }

  try {
    await prisma.unit.update({ where: { id }, data: { name } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi cập nhật đơn vị" }
  }
}

export async function updatePosition(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const id = formData.get("id") as string
  const name = formData.get("name") as string
  if (!id || !name) return { error: "Dữ liệu không hợp lệ" }

  try {
    await prisma.position.update({ where: { id }, data: { name } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi cập nhật chức vụ" }
  }
}
export async function createArea(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")
  const name = formData.get("name") as string
  if (!name) return { error: "T�n khu v?c kh�ng du?c tr?ng" }
  try {
    await prisma.area.create({ data: { name } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) { return { error: "L?i khi t?o khu v?c" } }
}

export async function updateArea(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  if (!id || !name) return { error: "D? li?u kh�ng h?p l?" }
  try {
    await prisma.area.update({ where: { id }, data: { name } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) { return { error: "L?i khi c?p nh?t khu v?c" } }
}

export async function deleteArea(id: string) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")
  try {
    await prisma.area.delete({ where: { id } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) { return { error: "Kh�ng th? x�a khu v?c dang c� d? li?u" } }
}

export async function createRoom(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")
  const name = formData.get("name") as string
  const areaId = formData.get("areaId") as string
  const managerId = formData.get("managerId") as string || null
  if (!name || !areaId) return { error: "Dữ liệu không được trống" }
  try {
    await prisma.room.create({ data: { name, areaId, managerId } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) { return { error: "Lỗi khi tạo phòng học" } }
}

export async function updateRoom(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const areaId = formData.get("areaId") as string
  const managerId = formData.get("managerId") as string || null
  if (!id || !name || !areaId) return { error: "Dữ liệu không hợp lệ" }
  try {
    await prisma.room.update({ where: { id }, data: { name, areaId, managerId } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) { return { error: "Lỗi khi cập nhật phòng học" } }
}

export async function deleteRoom(id: string) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")
  try {
    await prisma.room.delete({ where: { id } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) { return { error: "Kh�ng th? x�a ph�ng h?c dang c� thi?t b?" } }
}

export async function createClassroomEqCategory(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")
  const name = formData.get("name") as string
  if (!name) return { error: "T�n danh m?c kh�ng du?c tr?ng" }
  try {
    await prisma.classroomEqCategory.create({ data: { name } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) { return { error: "L?i khi t?o danh m?c" } }
}

export async function updateClassroomEqCategory(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  if (!id || !name) return { error: "D? li?u kh�ng h?p l?" }
  try {
    await prisma.classroomEqCategory.update({ where: { id }, data: { name } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) { return { error: "L?i khi c?p nh?t danh m?c" } }
}

export async function deleteClassroomEqCategory(id: string) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")
  try {
    await prisma.classroomEqCategory.delete({ where: { id } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) { return { error: "Kh�ng th? x�a danh m?c dang c� thi?t b?" } }
}

export async function createDeviceConfig(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")
  const name = formData.get("name") as string
  if (!name) return { error: "T�n c?u h�nh kh�ng du?c tr?ng" }
  try {
    await prisma.deviceConfig.create({ data: { name } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) { return { error: "L?i khi t?o c?u h�nh" } }
}

export async function updateDeviceConfig(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  if (!id || !name) return { error: "D? li?u kh�ng h?p l?" }
  try {
    await prisma.deviceConfig.update({ where: { id }, data: { name } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) { return { error: "L?i khi c?p nh?t c?u h�nh" } }
}

export async function deleteDeviceConfig(id: string) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")
  try {
    await prisma.deviceConfig.delete({ where: { id } })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) { return { error: "Kh�ng th? x�a c?u h�nh dang c� thi?t b?" } }
}
