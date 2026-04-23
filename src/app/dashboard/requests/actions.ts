"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateRequestStatus(requestId: string, status: "APPROVED" | "REJECTED" | "RETURNED", rejectionReason?: string) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  try {
    const request = await prisma.borrowRequest.findUnique({ 
      where: { id: requestId },
      include: { equipment: true }
    })
    if (!request) return { error: "Không tìm thấy yêu cầu" }

    // If approving, we need to check availableQty and reduce it
    if (status === "APPROVED" && request.status === "PENDING") {
      if (request.equipment.availableQty < request.quantity) {
        return { error: `Số lượng trong kho không đủ (Chỉ còn ${request.equipment.availableQty})` }
      }

      await prisma.$transaction([
        prisma.borrowRequest.update({ where: { id: requestId }, data: { status } }),
        prisma.equipment.update({
          where: { id: request.equipmentId },
          data: { availableQty: { decrement: request.quantity } }
        })
      ])
    } 
    // If returning, we need to increase availableQty and set actualReturnDate
    else if (status === "RETURNED" && request.status === "APPROVED") {
      await prisma.$transaction([
        prisma.borrowRequest.update({ 
          where: { id: requestId }, 
          data: { status, actualReturnDate: new Date() } 
        }),
        prisma.equipment.update({
          where: { id: request.equipmentId },
          data: { availableQty: { increment: request.quantity } }
        })
      ])
    }
    // Rejecting just updates status and rejectionReason
    else if (status === "REJECTED") {
      await prisma.borrowRequest.update({ 
        where: { id: requestId }, 
        data: { status, rejectionReason } 
      })
    }

    revalidatePath("/dashboard/requests")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi cập nhật trạng thái" }
  }
}
