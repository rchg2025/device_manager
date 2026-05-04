import { prisma } from "@/lib/prisma"

interface WriteLogParams {
  userId?: string | null
  action: string
  entity: string
  entityId?: string | null
  detail: string
}

/**
 * Ghi nhật ký hành động vào bảng SystemLog.
 * Hàm này không throw lỗi ra ngoài để không ảnh hưởng đến luồng chính.
 */
export async function writeLog(params: WriteLogParams) {
  try {
    await prisma.systemLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        detail: params.detail,
      }
    })
  } catch (e) {
    // Silently fail – log failures should not break business logic
    console.error("[SystemLog] Failed to write log:", e)
  }
}
