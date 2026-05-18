import { prisma } from "@/lib/prisma"
import BorrowCart from "./borrow-cart"
import { auth } from "@/auth"

export default async function BorrowPage() {
  const session = await auth()
  const role = session?.user?.role || "MEMBER"

  let members: { id: string, name: string | null, email: string | null }[] = []
  if (role === "ADMIN" || role === "MANAGER" || role === "SUPERADMIN") {
    members = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' }
    })
  }

  const equipments = await prisma.equipment.findMany({
    where: { availableQty: { gt: 0 } },
    select: {
      id: true,
      name: true,
      barcode: true,
      availableQty: true,
      category: { select: { name: true } }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Đăng ký mượn thiết bị</h2>
      <BorrowCart equipments={equipments} role={role} members={members} />
    </div>
  )
}
