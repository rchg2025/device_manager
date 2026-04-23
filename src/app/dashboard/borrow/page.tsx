import { prisma } from "@/lib/prisma"
import BorrowCart from "./borrow-cart"

export default async function BorrowPage() {
  const equipments = await prisma.equipment.findMany({
    where: { availableQty: { gt: 0 } },
    select: {
      id: true,
      name: true,
      availableQty: true,
      category: { select: { name: true } }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Đăng ký mượn thiết bị</h2>
      <BorrowCart equipments={equipments} />
    </div>
  )
}
