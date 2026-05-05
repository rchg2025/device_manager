import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Bắt đầu cập nhật cấu trúc Đa Chi Nhánh (Multi-tenant)...')

  // 1. Tạo "Đơn vị gốc" nếu chưa có
  let rootUnit = await prisma.unit.findFirst({
    where: { name: 'Đơn vị gốc' }
  })

  if (!rootUnit) {
    rootUnit = await prisma.unit.create({
      data: { name: 'Đơn vị gốc' }
    })
    console.log(`Đã tạo Đơn vị gốc với ID: ${rootUnit.id}`)
  } else {
    console.log(`Đơn vị gốc đã tồn tại với ID: ${rootUnit.id}`)
  }

  const unitId = rootUnit.id

  // 2. Gán Đơn vị gốc cho tất cả dữ liệu chưa có Đơn vị
  console.log('Đang gán unitId cho dữ liệu cũ...')

  const models = [
    'user',
    'position',
    'category',
    'equipment',
    'borrowRequest',
    'notification',
    'setting',
    'maintenance',
    'area',
    'room',
    'classroomEqCategory',
    'deviceConfig',
    'classroomEquipment',
    'inventorySession',
    'inventoryRecord',
    'systemLog'
  ]

  for (const model of models) {
    try {
      const result = await (prisma as any)[model].updateMany({
        where: { unitId: null },
        data: { unitId }
      })
      console.log(`- ${model}: Cập nhật ${result.count} bản ghi`)
    } catch (e: any) {
       console.log(`- ${model}: Lỗi hoặc không có trường unitId (${e.message})`)
    }
  }

  // 3. Nâng cấp nguyenluyen@nsg.edu.vn thành SUPERADMIN
  console.log('Đang nâng cấp nguyenluyen@nsg.edu.vn thành SUPERADMIN...')
  const admin = await prisma.user.findUnique({
    where: { email: 'nguyenluyen@nsg.edu.vn' }
  })

  if (admin) {
    await prisma.user.update({
      where: { email: 'nguyenluyen@nsg.edu.vn' },
      data: { 
        role: 'SUPERADMIN',
        unitId: null // SUPERADMIN có thể không cần gắn chết với 1 đơn vị
      }
    })
    console.log('✅ Đã cập nhật nguyenluyen@nsg.edu.vn thành SUPERADMIN')
  } else {
    console.log('❌ Không tìm thấy tài khoản nguyenluyen@nsg.edu.vn')
  }

  console.log('Hoàn thành!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
