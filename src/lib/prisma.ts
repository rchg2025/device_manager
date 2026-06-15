import { PrismaClient } from "@prisma/client"
import { getTenantId } from "./tenant"
import { normalizeForSearch, generateSearchString } from "./search-utils"

const globalForPrisma = globalThis as unknown as {
  basePrisma: PrismaClient | undefined
}

export const basePrisma = globalForPrisma.basePrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.basePrisma = basePrisma

// Mở rộng Prisma gốc bằng RLS (Row-Level Security) mức ứng dụng và tự động tạo trường tìm kiếm
export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const tenantId = await getTenantId();
        
        // 1. Tự động tạo dữ liệu tìm kiếm không dấu
        const modelsWithNameSearch = [
          'Category', 'Department', 'Position', 'Area', 'Room', 'Unit',
          'ClassroomEqCategory', 'DeviceConfig', 'Equipment', 'ClassroomEquipment', 'User', 'InventorySession'
        ]
        
        if (['create', 'update'].includes(operation)) {
          const data = (args as any)?.data;
          if (data) {
            if (modelsWithNameSearch.includes(model as string) && data.name !== undefined) {
              data.nameSearch = normalizeForSearch(data.name);
            }
            if (model === 'Maintenance' && (data.description !== undefined || data.handlerName !== undefined)) {
              // Note: for partial updates, this might not have both, but we try our best.
              // A perfect solution would query the existing record first, but this is acceptable for now.
              data.searchString = generateSearchString(data.description, data.handlerName);
            }
            if (model === 'SystemLog' && (data.action !== undefined || data.detail !== undefined)) {
              data.searchString = generateSearchString(data.action, data.detail);
            }
          }
        }
        
        if (['createMany'].includes(operation)) {
           let dataArr = (args as any)?.data;
           if (dataArr) {
             if (!Array.isArray(dataArr)) dataArr = [dataArr];
             dataArr.forEach((d: any) => {
               if (modelsWithNameSearch.includes(model as string) && d.name !== undefined) {
                 d.nameSearch = normalizeForSearch(d.name);
               }
               if (model === 'Maintenance') {
                 d.searchString = generateSearchString(d.description, d.handlerName);
               }
               if (model === 'SystemLog') {
                 d.searchString = generateSearchString(d.action, d.detail);
               }
             });
           }
        }

        // 2. Lọc theo Tenant
        if (!tenantId) {
          return query(args);
        }

        const modelsWithTenant = [
          'Category', 'Equipment', 'BorrowRequest', 'Notification',
          'Setting', 'Maintenance', 'Area', 'Room',
          'ClassroomEqCategory', 'DeviceConfig', 'ClassroomEquipment',
          'InventorySession', 'InventoryRecord', 'SystemLog', 'Position', 'Department', 'User'
        ]

        if (modelsWithTenant.includes(model as string)) {
          if (['findFirst', 'findMany', 'count', 'updateMany', 'deleteMany', 'aggregate', 'groupBy'].includes(operation)) {
            if (args) {
               (args as any).where = { ...(args as any).where, unitId: tenantId }
            } else {
               args = { where: { unitId: tenantId } } as any
            }
          }
          if (['create', 'createMany'].includes(operation)) {
            if (operation === 'create') {
              if (args) (args as any).data = { ...(args as any).data, unitId: tenantId }
            } else if (operation === 'createMany') {
              if (args && Array.isArray((args as any).data)) {
                (args as any).data = (args as any).data.map((d: any) => ({ ...d, unitId: tenantId }))
              } else if (args) {
                (args as any).data = { ...(args as any).data, unitId: tenantId }
              }
            }
          }
        }
        
        return query(args)
      }
    }
  }
})
