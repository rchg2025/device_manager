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

    if (request.user?.email && (status === "APPROVED" || status === "REJECTED" || status === "RETURNED")) {
      import("@/lib/email").then(m => m.sendStatusUpdateEmailToMember(
        request.user.email as string, 
        request.equipment.name, 
        status, 
        status === "REJECTED" ? rejectionReason : returnCondition
      )).catch(console.error)
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

    // Tìm thông tin thiết bị và quản lý danh mục
    const equipment = await prisma.equipment.findUnique({ 
      where: { id: request.equipmentId },
      include: { category: true }
    })
    
    const targetManagerId = equipment?.category?.managerId

    const targetUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: "ADMIN" },
          ...(targetManagerId ? [{ id: targetManagerId }] : [])
        ]
      }
    })

    if (targetUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetUsers.map(m => ({
          userId: m.id,
          message: `${session.user?.name || 'Một thành viên'} vừa gửi yêu cầu TRẢ thiết bị: ${equipment?.name}.`,
          link: "/dashboard/requests"
        }))
      })
    }

    const emails = targetUsers.map(u => u.email).filter(Boolean) as string[]
    if (emails.length > 0) {
      import("@/lib/email").then(m => m.sendReturnRequestEmailToAdmins(
        emails, 
        session.user?.name || "Một thành viên", 
        equipment?.name || "Thiết bị"
      )).catch(console.error)
    }

    revalidatePath("/dashboard/requests")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi đăng ký trả" }
  }
}

export async function deleteHistoryRecord(requestId: string) {
  try {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") return { error: "Không có quyền xóa lịch sử" }

    const request = await prisma.borrowRequest.findUnique({ where: { id: requestId } })
    if (!request) return { error: "Không tìm thấy yêu cầu" }

    if (request.status === "APPROVED" || request.status === "RETURN_REQUESTED") {
      return { error: "Không thể xóa lịch sử khi thiết bị chưa được trả" }
    }

    await prisma.borrowRequest.delete({ where: { id: requestId } })
    revalidatePath("/dashboard/requests")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi xóa lịch sử" }
  }
}
