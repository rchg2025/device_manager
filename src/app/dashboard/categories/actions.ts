"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createCategory(formData: FormData) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  if (!name) return { error: "Tên danh mục không được trống" }

  try {
    await prisma.category.create({
      data: { name }
    })
    revalidatePath("/dashboard/categories")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi tạo danh mục (có thể bị trùng tên)" }
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
  if (!id || !name) return { error: "Dữ liệu không hợp lệ" }

  try {
    await prisma.category.update({ where: { id }, data: { name } })
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
