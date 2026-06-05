import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (session?.user?.role === "MEMBER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'equipment'
    const q = searchParams.get('q') || ''
    
    const searchFilter = q ? { name: { contains: q, mode: 'insensitive' as const } } : {}

    let items: any[] = [];
    let excelData: any[] = [];
    let sheetName = "DanhSach";

    switch (tab) {
      case 'equipment':
        items = await prisma.category.findMany({ where: searchFilter, select: { id: true, name: true, manager: { select: { name: true } }, equipments: { select: { totalQty: true } } }, orderBy: { name: 'asc' } });
        excelData = items.map((item, index) => ({
          "STT": index + 1,
          "Tên danh mục": item.name,
          "Người quản lý": item.manager?.name || "Chưa phân công",
          "Tổng thiết bị": item.equipments?.reduce((sum: number, eq: any) => sum + (eq.totalQty || 0), 0) || 0
        }));
        sheetName = "DM_ThietBi";
        break;
      case 'unit':
        items = await prisma.department.findMany({ where: searchFilter, select: { id: true, name: true, _count: { select: { users: true } } }, orderBy: { name: 'asc' } });
        excelData = items.map((item, index) => ({
          "STT": index + 1,
          "Tên đơn vị": item.name,
          "Số thành viên": item._count?.users || 0
        }));
        sheetName = "DM_DonVi";
        break;
      case 'position':
        items = await prisma.position.findMany({ where: searchFilter, select: { id: true, name: true, _count: { select: { users: true } } }, orderBy: { name: 'asc' } });
        excelData = items.map((item, index) => ({
          "STT": index + 1,
          "Tên chức vụ": item.name,
          "Số thành viên": item._count?.users || 0
        }));
        sheetName = "DM_ChucVu";
        break;
      case 'area':
        items = await prisma.area.findMany({ where: searchFilter, select: { id: true, name: true, _count: { select: { rooms: true } } }, orderBy: { name: 'asc' } });
        excelData = items.map((item, index) => ({
          "STT": index + 1,
          "Tên khu vực": item.name,
          "Số phòng học": item._count?.rooms || 0
        }));
        sheetName = "DM_KhuVuc";
        break;
      case 'room':
        items = await prisma.room.findMany({ where: searchFilter, select: { id: true, name: true, area: { select: { name: true } }, manager: { select: { name: true } }, classroomEquipments: { select: { quantity: true } } }, orderBy: { name: 'asc' } });
        excelData = items.map((item, index) => ({
          "STT": index + 1,
          "Tên phòng": item.name,
          "Khu vực": item.area?.name || "",
          "Người quản lý": item.manager?.name || "Chưa phân công",
          "Số thiết bị": item.classroomEquipments?.reduce((sum: number, eq: any) => sum + (eq.quantity || 0), 0) || 0
        }));
        sheetName = "DM_PhongHoc";
        break;
      case 'classroom-eq-cat':
        items = await prisma.classroomEqCategory.findMany({ where: searchFilter, select: { id: true, name: true, equipments: { select: { quantity: true } } }, orderBy: { name: 'asc' } });
        excelData = items.map((item, index) => ({
          "STT": index + 1,
          "Tên danh mục": item.name,
          "Số thiết bị": item.equipments?.reduce((sum: number, eq: any) => sum + (eq.quantity || 0), 0) || 0
        }));
        sheetName = "DM_TBPhong";
        break;
      case 'config':
        items = await prisma.deviceConfig.findMany({ where: searchFilter, select: { id: true, name: true, _count: { select: { equipments: true } } }, orderBy: { name: 'asc' } });
        excelData = items.map((item, index) => ({
          "STT": index + 1,
          "Tên cấu hình": item.name,
          "Số thiết bị": item._count?.equipments || 0
        }));
        sheetName = "DM_CauHinh";
        break;
      default:
        return new NextResponse("Invalid tab", { status: 400 });
    }

    if (excelData.length === 0) {
      excelData = [{ "Thông báo": "Không có dữ liệu" }];
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    const wscols = Object.keys(excelData[0] || {}).map(key => ({ wch: Math.max(15, key.length + 5) }))
    worksheet['!cols'] = wscols

    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="DanhSach_${sheetName}_${new Date().toISOString().slice(0,10)}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
