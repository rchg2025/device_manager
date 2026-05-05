import { cookies } from "next/headers"
import { cache } from "react"

export const getTenantId = cache(async () => {
  try {
    // Sử dụng dynamic import để tránh circular dependency: prisma.ts -> tenant.ts -> auth.ts -> prisma.ts
    const { auth } = await import("@/auth")
    const session = await auth()
    const role = session?.user?.role
    
    // Nếu là SUPERADMIN, ưu tiên lấy từ cookie (Tenant Switcher)
    if (role === "SUPERADMIN") {
      const c = await cookies()
      const tenantId = c.get('tenantId')?.value
      return tenantId || null // Nếu rỗng là đang xem "Tất cả"
    }
    
    // Nếu là user bình thường, lấy unitId từ session của chính họ
    return (session?.user as any)?.unitId || null
  } catch (e) {
    return null
  }
})
