"use server"
import { basePrisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function transferData(fromUnitId: string, toUnitId: string, dataTypes: string[]) {
  const session = await auth()
  if (session?.user?.role !== "SUPERADMIN") return { error: "Không có quyền" }
  
  if (!fromUnitId || !toUnitId) return { error: "Vui lòng chọn đơn vị nguồn và đích" }
  if (fromUnitId === toUnitId) return { error: "Đơn vị nguồn và đích phải khác nhau" }
  if (!dataTypes || dataTypes.length === 0) return { error: "Vui lòng chọn ít nhất một loại dữ liệu để chuyển" }

  try {
    const results: Record<string, number> = {}

    // Sử dụng transaction để đảm bảo an toàn (hoặc có thể không cần nếu dữ liệu quá lớn)
    for (const type of dataTypes) {
      let count = 0;
      switch (type) {
        case "categories":
          count = (await basePrisma.category.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          results["Danh mục"] = count;
          break;
        case "equipments":
          count = (await basePrisma.equipment.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          results["Thiết bị"] = count;
          break;
        case "users":
          // Không chuyển SUPERADMIN
          count = (await basePrisma.user.updateMany({ 
            where: { unitId: fromUnitId, role: { not: "SUPERADMIN" } }, 
            data: { unitId: toUnitId } 
          })).count;
          results["Người dùng"] = count;
          break;
        case "borrowRequests":
          count = (await basePrisma.borrowRequest.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          results["Yêu cầu mượn trả"] = count;
          break;
        case "inventory":
          count = (await basePrisma.inventorySession.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          let recordCount = (await basePrisma.inventoryRecord.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          results["Phiếu kiểm kê"] = count + recordCount;
          break;
        case "maintenance":
          count = (await basePrisma.maintenance.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          results["Bảo trì"] = count;
          break;
        case "areasRooms":
          let areaCount = (await basePrisma.area.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          let roomCount = (await basePrisma.room.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          results["Khu vực & Phòng"] = areaCount + roomCount;
          break;
        case "classroomEquipments":
          let catCount = (await basePrisma.classroomEqCategory.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          count = (await basePrisma.classroomEquipment.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          results["Thiết bị phòng học"] = count + catCount;
          break;
        case "configs":
          let configCount = (await basePrisma.deviceConfig.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          let logCount = (await basePrisma.systemLog.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          let posCount = (await basePrisma.position.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          let settingCount = (await basePrisma.setting.updateMany({ where: { unitId: fromUnitId }, data: { unitId: toUnitId } })).count;
          results["Cấu hình & Nhật ký"] = configCount + logCount + posCount + settingCount;
          break;
      }
    }

    return { success: true, results }
  } catch (error: any) {
    console.error("Transfer error:", error);
    return { error: "Có lỗi xảy ra trong quá trình chuyển dữ liệu: " + error.message }
  }
}
