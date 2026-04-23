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
