"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createBorrowRequest(formData: FormData) {
  // Existing function body
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

export async function createMultipleBorrowRequests(items: Array<{ equipmentId: string, quantity: number, borrowDate: string, returnDate: string }>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  if (!items || items.length === 0) {
    return { error: "Danh sách trống" }
  }

  try {
    const userId = session.user.id

    // Process all items in a transaction to ensure either all succeed or none do
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const borrowDate = new Date(item.borrowDate)
        const returnDate = new Date(item.returnDate)

        if (borrowDate >= returnDate) {
          throw new Error(`Ngày trả phải sau ngày mượn cho thiết bị đã chọn`)
        }

        const equipment = await tx.equipment.findUnique({ where: { id: item.equipmentId } })
        if (!equipment || equipment.availableQty < item.quantity) {
          throw new Error(`Số lượng không đủ cho thiết bị: ${equipment?.name || item.equipmentId}`)
        }

        await tx.borrowRequest.create({
          data: {
            userId,
            equipmentId: item.equipmentId,
            quantity: item.quantity,
            borrowDate,
            returnDate,
            status: "PENDING"
          }
        })
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/borrow")
    revalidatePath("/dashboard/requests")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Lỗi khi tạo yêu cầu mượn" }
  }
}
