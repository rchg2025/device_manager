import { prisma } from "@/lib/prisma"
import { createBorrowRequest } from "./actions"

export default async function BorrowPage() {
  const equipments = await prisma.equipment.findMany({
    where: { availableQty: { gt: 0 } },
    include: { category: true }
  })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Đăng ký mượn thiết bị</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl">
        <form action={async (formData) => { "use server"; await createBorrowRequest(formData) }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Chọn thiết bị</label>
            <select name="equipmentId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border">
              <option value="">-- Chọn thiết bị cần mượn --</option>
              {equipments.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} (Sẵn sàng: {eq.availableQty}) - {eq.category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
            <input type="number" name="quantity" min="1" required defaultValue="1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày mượn</label>
              <input type="date" name="borrowDate" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày trả dự kiến</label>
              <input type="date" name="returnDate" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium">
            Gửi Yêu Cầu
          </button>
        </form>
      </div>
    </div>
  )
}
