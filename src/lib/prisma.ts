import { PrismaClient } from "@prisma/client"
import { getTenantId } from "./tenant"

const globalForPrisma = globalThis as unknown as {
  basePrisma: PrismaClient | undefined
}

export const basePrisma = globalForPrisma.basePrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.basePrisma = basePrisma

// Mở rộng Prisma gốc bằng RLS (Row-Level Security) mức ứng dụng
export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const tenantId = await getTenantId();
        
        // Nếu không có tenantId (SUPERADMIN xem tất cả, hoặc lỗi), thì bỏ qua lọc
        if (!tenantId) {
          return query(args);
        }

        const modelsWithTenant = [
          'Category', 'Equipment', 'BorrowRequest', 'Notification',
          'Setting', 'Maintenance', 'Area', 'Room',
          'ClassroomEqCategory', 'DeviceConfig', 'ClassroomEquipment',
          'InventorySession', 'InventoryRecord', 'SystemLog', 'Position'
        ]

        if (modelsWithTenant.includes(model as string)) {
          if (['findUnique', 'findFirst', 'findMany', 'count', 'update', 'updateMany', 'delete', 'deleteMany', 'aggregate', 'groupBy'].includes(operation)) {
            // Cảnh báo: với findUnique, nếu thêm unitId sẽ bị lỗi Prisma nếu unitId không phải field unique
            // Nên với findUnique/update/delete (những hàm yêu cầu unique where), 
            // ta chỉ có thể áp dụng nếu ta đổi Schema (Composite Unique).
            // Tạm thời bỏ qua findUnique, update, delete (chỉ áp dụng cho các hàm đọc nhiều)
            if (['findFirst', 'findMany', 'count', 'updateMany', 'deleteMany', 'aggregate', 'groupBy'].includes(operation)) {
              if (args) {
                 args.where = { ...args.where, unitId: tenantId }
              } else {
                 args = { where: { unitId: tenantId } } as any
              }
            }
          }
          if (['create', 'createMany'].includes(operation)) {
            if (operation === 'create') {
              if (args) args.data = { ...args.data as any, unitId: tenantId }
            } else if (operation === 'createMany') {
              if (args && Array.isArray(args.data)) {
                args.data = args.data.map((d: any) => ({ ...d, unitId: tenantId }))
              } else if (args) {
                args.data = { ...args.data as any, unitId: tenantId }
              }
            }
          }
        }
        return query(args)
      }
    }
  }
})
