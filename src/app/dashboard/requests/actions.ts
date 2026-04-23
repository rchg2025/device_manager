"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateRequestStatus(requestId: string, status: "APPROVED" | "REJECTED" | "RETURNED") {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  try {
    const request = await prisma.borrowRequest.findUnique({ where: { id: requestId } })
    if (!request) return { error: "Không tìm thấy yêu cầu" }

    // If approving, we need to reduce availableQty
    if (status === "APPROVED" && request.status === "PENDING") {
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
    // Rejecting just updates status
    else {
      await prisma.borrowRequest.update({ where: { id: requestId }, data: { status } })
    }

    revalidatePath("/dashboard/requests")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi cập nhật trạng thái" }
  }
}
