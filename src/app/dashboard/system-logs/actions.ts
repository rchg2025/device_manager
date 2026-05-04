"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function deleteLogsByAge(daysAgo: number | 'all') {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") return { error: "Chỉ Quản trị viên mới có quyền xóa nhật ký" }

  try {
    if (daysAgo === 'all') {
      await prisma.systemLog.deleteMany({})
    } else {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - daysAgo)
      await prisma.systemLog.deleteMany({
        where: { createdAt: { lt: cutoff } }
      })
    }
    revalidatePath("/dashboard/system-logs")
    return { success: true }
  } catch (error: any) {
    return { error: "Lỗi khi xóa nhật ký: " + error.message }
  }
}
