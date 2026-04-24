import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 }, { status: 401 })
    }

    const role = session.user.role

    let count = 0
    if (role !== "MEMBER") {
      let whereClause: any = { status: { in: ["PENDING", "RETURN_REQUESTED"] } }
      if (role === "MANAGER") {
        whereClause.equipment = {
          category: {
            OR: [
              { managerId: null },
              { managerId: session.user.id }
            ]
          }
        }
      }
      count = await prisma.borrowRequest.count({
        where: whereClause
      })
    } else {
      count = await prisma.notification.count({
        where: { userId: session.user.id, isRead: false }
      })
    }

    return NextResponse.json({ count })
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
