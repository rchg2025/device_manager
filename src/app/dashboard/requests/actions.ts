"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function updateRequestStatus(
  requestId: string, 
  status: "APPROVED" | "REJECTED" | "RETURNED" | "RETURN_REQUESTED", 
  rejectionReason?: string,
  returnCondition?: string
) {
  const session = await auth()
  if (session?.user?.role === "MEMBER") throw new Error("Unauthorized")

  try {
    const request = await prisma.borrowRequest.findUnique({ 
      where: { id: requestId },
      include: { equipment: true, user: true }
    })
    if (!request) return { error: "Không tìm thấy yêu cầu" }

    const reviewerName = session?.user?.name || "Admin"

    // If approving, we need to check availableQty and reduce it
    if (status === "APPROVED" && request.status === "PENDING") {
      if (request.equipment.availableQty < request.quantity) {
        return { error: `Số lượng trong kho không đủ (Chỉ còn ${request.equipment.availableQty})` }
      }

      await prisma.$transaction([
        prisma.borrowRequest.update({ 
          where: { id: requestId }, 
          data: { status, reviewerName, approvedAt: new Date() } 
        }),
        prisma.equipment.update({
          where: { id: request.equipmentId },
          data: { availableQty: { decrement: request.quantity } }
        }),
        prisma.notification.create({
          data: {
            userId: request.userId,
            message: `Yêu cầu mượn "${request.equipment.name}" đã được duyệt bởi ${reviewerName}.`,
            link: "/dashboard/requests"
          }
        })
      ])
    } 
    // If returning, we need to increase availableQty and set actualReturnDate
    else if (status === "RETURNED" && (request.status === "APPROVED" || request.status === "RETURN_REQUESTED")) {
      await prisma.$transaction([
        prisma.borrowRequest.update({ 
          where: { id: requestId }, 
          data: { status, actualReturnDate: new Date(), returnCondition, returnReviewerName: reviewerName } 
        }),
        prisma.equipment.update({
          where: { id: request.equipmentId },
          data: { availableQty: { increment: request.quantity } }
        }),
        prisma.notification.create({
          data: {
            userId: request.userId,
            message: `Thiết bị "${request.equipment.name}" đã được xác nhận trả bởi ${reviewerName}.`,
            link: "/dashboard/requests"
          }
        })
      ])
    }
    // Rejecting just updates status and rejectionReason
    else if (status === "REJECTED") {
      await prisma.$transaction([
        prisma.borrowRequest.update({ 
          where: { id: requestId }, 
          data: { status, rejectionReason, reviewerName, approvedAt: new Date() } 
        }),
        prisma.notification.create({
          data: {
            userId: request.userId,
            message: `Yêu cầu mượn "${request.equipment.name}" đã bị từ chối bởi ${reviewerName}. Lý do: ${rejectionReason}`,
            link: "/dashboard/requests"
          }
        })
      ])
    }

    revalidatePath("/dashboard/requests")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi cập nhật trạng thái" }
  }
}

export async function requestReturn(requestId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  try {
    const request = await prisma.borrowRequest.findUnique({ where: { id: requestId } })
    if (!request || request.userId !== session.user.id) {
      return { error: "Không tìm thấy yêu cầu hoặc bạn không có quyền" }
    }

    if (request.status !== "APPROVED") {
      return { error: "Chỉ có thể đăng ký trả khi thiết bị đang mượn" }
    }

    await prisma.borrowRequest.update({
      where: { id: requestId },
      data: { status: "RETURN_REQUESTED" }
    })

    revalidatePath("/dashboard/requests")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi đăng ký trả" }
  }
}
