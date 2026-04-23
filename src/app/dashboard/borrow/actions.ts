"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createBorrowRequest(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const equipmentId = formData.get("equipmentId") as string
  const quantity = parseInt(formData.get("quantity") as string || "1")
  const borrowDateStr = formData.get("borrowDate") as string
  const returnDateStr = formData.get("returnDate") as string

  if (!equipmentId || quantity < 1 || !borrowDateStr || !returnDateStr) {
    return { error: "Dữ liệu không hợp lệ" }
  }

  const borrowDate = new Date(borrowDateStr)
  const returnDate = new Date(returnDateStr)

  if (borrowDate >= returnDate) {
    return { error: "Ngày trả phải sau ngày mượn" }
  }

  try {
    // Check available quantity
    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } })
    if (!equipment || equipment.availableQty < quantity) {
      return { error: "Số lượng thiết bị không đủ" }
    }

    await prisma.borrowRequest.create({
      data: {
        userId: session.user.id,
        equipmentId,
        quantity,
        borrowDate,
        returnDate,
        status: "PENDING"
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/borrow")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi tạo yêu cầu mượn" }
  }
}
