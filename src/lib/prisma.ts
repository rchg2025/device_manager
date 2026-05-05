import { PrismaClient } from "@prisma/client"
import { cookies } from "next/headers"

const globalForPrisma = globalThis as unknown as {
  basePrisma: PrismaClient | undefined
}

export const basePrisma = globalForPrisma.basePrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.basePrisma = basePrisma

// Lấy tenantId từ request context
const getTenantPrisma = async () => {
  let tenantId: string | null = null;
  let isSuperAdmin = false;

  try {
    const c = await cookies()
    tenantId = c.get('tenantId')?.value || null;
    isSuperAdmin = c.get('isSuperAdmin')?.value === 'true';
  } catch (e) {
    // Không nằm trong Next.js request context
  }

  if (isSuperAdmin && !tenantId) return basePrisma;
  if (!tenantId) return basePrisma; 

  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const modelsWithTenant = [
            'Category', 'Equipment', 'BorrowRequest', 'Notification',
            'Setting', 'Maintenance', 'Area', 'Room',
            'ClassroomEqCategory', 'DeviceConfig', 'ClassroomEquipment',
            'InventorySession', 'InventoryRecord', 'SystemLog', 'Position'
          ]

          if (modelsWithTenant.includes(model as string)) {
            if (['findUnique', 'findFirst', 'findMany', 'count', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
              if (args) {
                 args.where = { ...args.where, unitId: tenantId }
              } else {
                 args = { where: { unitId: tenantId } } as any
              }
            }
            if (['create', 'createMany'].includes(operation)) {
              if (operation === 'create') {
                args.data = { ...args.data as any, unitId: tenantId }
              } else if (operation === 'createMany') {
                if (Array.isArray(args.data)) {
                  args.data = args.data.map(d => ({ ...d, unitId: tenantId }))
                } else {
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
}

// Proxy thần thánh giúp tự động áp dụng RLS mà không cần sửa code cũ!
export const prisma = new Proxy(basePrisma, {
  get(target, prop) {
    // Cho phép các thuộc tính cơ sở như $transaction, $disconnect
    if (prop === '$transaction' || prop === '$connect' || prop === '$disconnect' || prop === '$on' || prop === '$use' || prop === '$extends') {
      return (target as any)[prop].bind(target);
    }
    
    const model = (target as any)[prop];
    if (!model || typeof model !== 'object') return model;

    return new Proxy(model, {
      get(modelTarget, operation) {
        if (typeof modelTarget[operation] !== 'function') return modelTarget[operation];
        
        return async (...args: any[]) => {
           const db = await getTenantPrisma();
           return (db as any)[prop][operation](...args);
        }
      }
    })
  }
}) as PrismaClient;
