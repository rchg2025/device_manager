"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Plus, Minus, Trash2, Send } from "lucide-react"
import { createMultipleBorrowRequests } from "./actions"
import QrScannerModal from "./qr-scanner-modal"
import { normalizeForSearch } from "@/lib/search-utils"
import toast from "react-hot-toast"

type CartItem = {
  id: string; // Temporary unique ID for the cart
  equipmentId: string;
  name: string;
  categoryName: string;
  quantity: number;
  borrowDate: string;
  returnDate: string;
}

type Member = { id: string, name: string | null, email: string | null }

export default function BorrowCart({ equipments, role = "MEMBER", members = [] }: { equipments: any[], role?: string, members?: Member[] }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Form State
  const [selectedEqId, setSelectedEqId] = useState("")
  const [searchEq, setSearchEq] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [borrowDate, setBorrowDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [minDate, setMinDate] = useState("")
  const [forUserId, setForUserId] = useState("")

  useEffect(() => {
    const today = new Date()
    const tzoffset = today.getTimezoneOffset() * 60000
    const localToday = new Date(Date.now() - tzoffset).toISOString().slice(0, 16)
    
    const retDate = new Date()
    retDate.setDate(retDate.getDate() + 3)
    const localRetDate = new Date(retDate.getTime() - retDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    
    setBorrowDate(localToday)
    setReturnDate(localRetDate)
    setMinDate(localToday)
  }, [])

  const handleScanSuccess = (barcode: string) => {
    const eq = equipments.find(e => e.barcode === barcode)
    if (eq) {
      setSelectedEqId(eq.id)
      setSearchEq(`${eq.name} (Sẵn sàng: ${eq.availableQty})`)
      setError("")
    } else {
      setError(`Không tìm thấy thiết bị nào có mã QR: ${barcode}`)
    }
  }

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
    setSearchEq("")
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

    const res = await createMultipleBorrowRequests(payload, forUserId)
    if (res?.error) {
      if (res.failedEquipmentId) {
        // Show specific alert and remove item
        toast.error(res.error)
        setCartItems(cartItems.filter(item => item.equipmentId !== res.failedEquipmentId))
      } else {
        setError(res.error)
      }
      setIsLoading(false)
    } else {
      setCartItems([])
      setIsLoading(false)
      toast.success("Đã gửi yêu cầu mượn thành công!")
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
            {(role === "ADMIN" || role === "MANAGER" || role === "SUPERADMIN") && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Chọn tài khoản mượn (Mượn hộ)</label>
                <select 
                  value={forUserId} 
                  onChange={(e) => setForUserId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border bg-white"
                >
                  <option value="">-- Mượn cho bản thân --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} {m.email ? `(${m.email})` : ''}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-gray-700">Chọn thiết bị</label>
                <QrScannerModal onScanSuccess={handleScanSuccess} />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên, mã vạch hoặc danh mục để tìm kiếm..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                  value={searchEq}
                  onChange={(e) => {
                    setSearchEq(e.target.value);
                    setIsDropdownOpen(true);
                    if (!e.target.value) setSelectedEqId("");
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                />
                
                {isDropdownOpen && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {equipments.filter(eq => {
                      const qNormalized = normalizeForSearch(searchEq);
                      const eqNameNorm = normalizeForSearch(eq.name);
                      const catNameNorm = normalizeForSearch(eq.category.name);
                      const barcodeNorm = normalizeForSearch(eq.barcode || "");
                      return eqNameNorm.includes(qNormalized) || catNameNorm.includes(qNormalized) || barcodeNorm.includes(qNormalized);
                    }).map(eq => (
                      <li 
                        key={eq.id}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-sm border-b last:border-0"
                        onClick={() => {
                          setSelectedEqId(eq.id);
                          setSearchEq(`${eq.name} (Sẵn sàng: ${eq.availableQty})`);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="font-medium">{eq.name}</div>
                        <div className="text-xs text-gray-500 flex gap-2">
                          <span>Sẵn sàng: <span className={eq.availableQty > 0 ? "text-green-600 font-semibold" : "text-red-600"}>{eq.availableQty}</span></span>
                          <span>|</span>
                          <span>DM: {eq.category.name}</span>
                          {eq.barcode && <><span>|</span><span>Mã: {eq.barcode}</span></>}
                        </div>
                      </li>
                    ))}
                    {equipments.filter(eq => {
                      const qNormalized = normalizeForSearch(searchEq);
                      const eqNameNorm = normalizeForSearch(eq.name);
                      const catNameNorm = normalizeForSearch(eq.category.name);
                      const barcodeNorm = normalizeForSearch(eq.barcode || "");
                      return eqNameNorm.includes(qNormalized) || catNameNorm.includes(qNormalized) || barcodeNorm.includes(qNormalized);
                    }).length === 0 && (
                      <li className="p-3 text-sm text-gray-500 text-center">Không tìm thấy thiết bị phù hợp</li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Số lượng</label>
              <div className="flex mt-1 rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(prev => Math.max(1, (prev || 0) - 1))}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity === 0 ? "" : quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setQuantity(isNaN(val) ? 0 : val);
                  }}
                  onBlur={() => {
                    if (!quantity || quantity < 1) setQuantity(1);
                  }}
                  className="relative flex-1 block w-full rounded-none border-y border-x-0 border-gray-300 py-2 px-3 text-center focus:z-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
                <button
                  type="button"
                  onClick={() => setQuantity(prev => (prev || 0) + 1)}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày mượn</label>
              <input 
                type="datetime-local" 
                min={minDate}
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày trả dự kiến</label>
              <input 
                type="datetime-local" 
                min={borrowDate || minDate}
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
              <ShoppingCart className="w-4 h-4" /> Thêm vào danh sách
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.borrowDate).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.returnDate).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</td>
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
