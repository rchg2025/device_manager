"use client"

import { useState } from "react"
import { ShoppingCart, Plus, Trash2, Send } from "lucide-react"
import { createMultipleBorrowRequests } from "./actions"

type CartItem = {
  id: string; // Temporary unique ID for the cart
  equipmentId: string;
  name: string;
  categoryName: string;
  quantity: number;
  borrowDate: string;
  returnDate: string;
}

export default function BorrowCart({ equipments }: { equipments: any[] }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Form State
  const [selectedEqId, setSelectedEqId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [borrowDate, setBorrowDate] = useState("")
  const [returnDate, setReturnDate] = useState("")

  const handleAddToCart = () => {
    if (!selectedEqId || !borrowDate || !returnDate || quantity < 1) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (new Date(borrowDate) >= new Date(returnDate)) {
      setError("Ngày trả phải sau ngày mượn")
      return
    }

    const eq = equipments.find(e => e.id === selectedEqId)
    if (!eq) return

    if (quantity > eq.availableQty) {
      setError(`Số lượng vượt quá số dư hiện tại (${eq.availableQty})`)
      return
    }

    // Check if already in cart
    const existingIndex = cartItems.findIndex(i => i.equipmentId === selectedEqId)
    if (existingIndex > -1) {
      const updatedCart = [...cartItems]
      const newQty = updatedCart[existingIndex].quantity + quantity
      if (newQty > eq.availableQty) {
        setError(`Tổng số lượng mượn vượt quá số dư hiện tại (${eq.availableQty})`)
        return
      }
      updatedCart[existingIndex].quantity = newQty
      setCartItems(updatedCart)
    } else {
      setCartItems([
        ...cartItems,
        {
          id: Math.random().toString(36).substring(7),
          equipmentId: selectedEqId,
          name: eq.name,
          categoryName: eq.category.name,
          quantity,
          borrowDate,
          returnDate
        }
      ])
    }

    // Reset form partially
    setSelectedEqId("")
    setQuantity(1)
    setError("")
  }

  const handleRemoveFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const handleSubmit = async () => {
    if (cartItems.length === 0) return
    setIsLoading(true)
    setError("")

    const payload = cartItems.map(item => ({
      equipmentId: item.equipmentId,
      quantity: item.quantity,
      borrowDate: item.borrowDate,
      returnDate: item.returnDate
    }))

    const res = await createMultipleBorrowRequests(payload)
    if (res?.error) {
      setError(res.error)
      setIsLoading(false)
    } else {
      setCartItems([])
      setIsLoading(false)
      alert("Đã gửi yêu cầu mượn thành công!")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cột trái: Form chọn thiết bị */}
      <div className="col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Thêm vào danh sách
          </h3>

          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Chọn thiết bị</label>
              <select 
                value={selectedEqId}
                onChange={(e) => setSelectedEqId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
              >
                <option value="">-- Chọn thiết bị cần mượn --</option>
                {equipments.map((eq: any) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} (Sẵn sàng: {eq.availableQty}) - {eq.category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Số lượng</label>
              <input 
                type="number" 
                min="1" 
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày mượn</label>
              <input 
                type="date" 
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày trả dự kiến</label>
              <input 
                type="date" 
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" 
              />
            </div>

            <button 
              type="button" 
              onClick={handleAddToCart}
              className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 font-medium flex justify-center items-center gap-2 border border-gray-300"
            >
              <ShoppingCart className="w-4 h-4" /> Bỏ vào danh sách
            </button>
          </div>
        </div>
      </div>

      {/* Cột phải: Danh sách đã chọn (Cart) */}
      <div className="col-span-1 lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Danh sách thiết bị muốn mượn ({cartItems.length})
            </h3>
          </div>
          
          <div className="flex-1 p-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày mượn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày trả</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.categoryName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.borrowDate).toLocaleDateString("vi-VN")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.returnDate).toLocaleDateString("vi-VN")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-600 hover:text-red-900" title="Xóa khỏi danh sách">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {cartItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>Danh sách trống. Vui lòng chọn thiết bị ở form bên cạnh.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <button 
              onClick={handleSubmit}
              disabled={cartItems.length === 0 || isLoading}
              className={`w-full py-3 px-4 rounded-md font-medium flex justify-center items-center gap-2 shadow-sm text-white
                ${cartItems.length === 0 || isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Gửi Yêu Cầu ({cartItems.length} thiết bị)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
