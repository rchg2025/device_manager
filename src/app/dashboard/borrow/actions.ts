"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { writeLog } from "@/lib/system-log"
import { after } from "next/server"



export async function createMultipleBorrowRequests(items: Array<{ equipmentId: string, quantity: number, borrowDate: string, returnDate: string }>, forUserId?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  if (!items || items.length === 0) {
    return { error: "Danh sách trống" }
  }

  try {
    let userId = session.user.id
    let userName = session.user.name || "Một thành viên"
    let userEmail = session.user.email
    const userRole = session.user.role || "MEMBER"

    if (forUserId && (userRole === "ADMIN" || userRole === "MANAGER" || userRole === "SUPERADMIN")) {
      const targetUser = await prisma.user.findUnique({ where: { id: forUserId } })
      if (targetUser) {
        userId = targetUser.id
        userName = targetUser.name || "Một thành viên"
        userEmail = targetUser.email || userEmail
      }
    }

    // Prepare detailed items and target managers
    const equipmentIds = items.map(i => i.equipmentId)
    const equipments = await prisma.equipment.findMany({ 
      where: { id: { in: equipmentIds } }, 
      select: { id: true, name: true, image: true, category: { select: { managerId: true } } } 
    })
    const targetManagerIds = new Set<string>()
    let hasSharedCategory = false
    
    equipments.forEach(eq => {
      if (eq.category?.managerId) {
        targetManagerIds.add(eq.category.managerId)
      } else {
        hasSharedCategory = true
      }
    })

    const detailedItems = items.map(item => {
      const eq = equipments.find(e => e.id === item.equipmentId)
      return {
        ...item,
        name: eq?.name || "Thiết bị không xác định",
        image: eq?.image || ""
      }
    })

    // Process all items in a transaction to ensure either all succeed or none do
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const borrowDate = new Date(item.borrowDate)
        const returnDate = new Date(item.returnDate)

        if (borrowDate >= returnDate) {
          throw new Error(JSON.stringify({ message: "Ngày trả phải sau ngày mượn", equipmentId: item.equipmentId }))
        }

        const equipment = await tx.equipment.findUnique({ where: { id: item.equipmentId } })
        if (!equipment || equipment.availableQty < item.quantity) {
          throw new Error(JSON.stringify({ 
            message: `Không còn thiết bị để cho mượn vui lòng liên hệ quản lý để được hỗ trợ hoặc mượn thiết bị khác`, 
            equipmentId: item.equipmentId 
          }))
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

      const notifyWhere: any = {
        OR: [
          { role: "ADMIN" },
          { role: "SUPERADMIN" }
        ]
      }
      
      if (hasSharedCategory) {
        notifyWhere.OR.push({ role: "MANAGER" })
      } else if (targetManagerIds.size > 0) {
        notifyWhere.OR.push({ id: { in: Array.from(targetManagerIds) as string[] } })
      }

      // Notify all admins and specific managers
      const targetUsers = await tx.user.findMany({
        where: notifyWhere
      })

      if (targetUsers.length > 0) {
        await tx.notification.createMany({
          data: targetUsers.map(m => ({
            userId: m.id,
            message: `${userName} vừa gửi yêu cầu mượn ${items.length} thiết bị.`,
            link: "/dashboard/requests"
          }))
        })
      }
    })

    const emailNotifyWhere: any = {
      email: { not: null },
      OR: []
    }
    
    if (targetManagerIds.size > 0) {
      emailNotifyWhere.OR.push({ id: { in: Array.from(targetManagerIds) as string[] } })
    }
    
    // Fallback: If no manager is specifically assigned to any of the categories, we can omit sending to ADMINs or send to ADMINs.
    // Dựa theo yêu cầu "chỉ gửi ... cho Nhân viên quản lý thiết bị đó thôi". 
    // Nếu không có manager, chúng ta có thể không gửi. 
    // Hoặc gửi cho MANAGER role nói chung?
    // User: "fix lại chỉ gửi email thông báo cho tài khoản email của Nhân viên quản lý thiết bị đó thôi"
    if (emailNotifyWhere.OR.length > 0) {
      // Gửi email bất đồng bộ cho Quản lý
      after(async () => {
        const targetUserWithEmails = await prisma.user.findMany({
          where: emailNotifyWhere,
          select: { email: true }
        })
        const emails = targetUserWithEmails.map(a => a.email as string).filter(e => e)
        if (emails.length > 0) {
          import("@/lib/email").then(m => m.sendBorrowRequestEmailToAdmins(emails, userName, detailedItems)).catch(console.error)
        }
      })
    }

    // Gửi email cho người mượn
    if (userEmail) {
      after(async () => {
        import("@/lib/email").then(m => m.sendBorrowRequestEmailToMember(userEmail as string, userName, detailedItems)).catch(console.error)
      })
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/borrow")
    revalidatePath("/dashboard/requests")
    await writeLog({
      userId: session.user.id,
      action: "CREATE",
      entity: "request",
      entityId: null,
      detail: `Tạo yêu cầu mượn ${items.length} thiết bị`
    })
    return { success: true }
  } catch (error: any) {
    try {
      const parsedError = JSON.parse(error.message)
      return { error: parsedError.message, failedEquipmentId: parsedError.equipmentId }
    } catch {
      return { error: error.message || "Lỗi khi tạo yêu cầu mượn" }
    }
  }
}
