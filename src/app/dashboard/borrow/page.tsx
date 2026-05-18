import { prisma } from "@/lib/prisma"
import BorrowCart from "./borrow-cart"
import { auth } from "@/auth"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

async function BorrowFormLoader() {
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

  return <BorrowCart equipments={equipments} role={role} members={members} />
}

export default function BorrowPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Đăng ký mượn thiết bị</h2>
      <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
        <BorrowFormLoader />
      </Suspense>
    </div>
  )
}

