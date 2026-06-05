import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import ExcelJS from "exceljs"
import QRCode from "qrcode"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (session?.user?.role === "MEMBER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Params from /dashboard/classroom-equipments/list
    const roomName = searchParams.get('roomName') || ""
    const managerName = searchParams.get('managerName') || ""
    const equipmentName = searchParams.get('equipmentName') || ""
    
    // Params from /dashboard/classroom-equipments
    const query = searchParams.get('query') || ""
    const areaId = searchParams.get('areaId') || ""
    const roomId = searchParams.get('roomId') || ""
    const categoryId = searchParams.get('categoryId') || ""

    const whereClause: any = {}
    
    if (roomName) {
      whereClause.room = { name: { contains: roomName, mode: 'insensitive' } }
    }
    
    if (managerName) {
      if (!whereClause.room) whereClause.room = {}
      whereClause.room.manager = { name: { contains: managerName, mode: 'insensitive' } }
    }
    
    if (equipmentName) {
      whereClause.name = { contains: equipmentName, mode: 'insensitive' }
    }

    if (query) {
      whereClause.name = { contains: query, mode: 'insensitive' }
    }
    
    if (areaId) whereClause.areaId = areaId
    if (roomId) whereClause.roomId = roomId
    if (categoryId) whereClause.categoryId = categoryId

    const equipments = await prisma.classroomEquipment.findMany({
      where: whereClause,
      include: {
        room: { select: { name: true } },
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('MaQR_TB_PhongHoc');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Tên thiết bị', key: 'name', width: 40 },
      { header: 'Phòng học', key: 'room', width: 25 },
      { header: 'Mã vạch', key: 'barcode', width: 25 },
      { header: 'Mã QR', key: 'qr', width: 20 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    for (let i = 0; i < equipments.length; i++) {
      const eq = equipments[i];
      const row = sheet.addRow({
        stt: i + 1,
        name: eq.name,
        room: eq.room?.name || "Chưa phân bổ",
        barcode: eq.id || "",
        qr: ''
      });
      
      row.alignment = { vertical: 'middle' };

      if (eq.id) {
        try {
          const qrDataUrl = await QRCode.toDataURL(eq.id, { margin: 1, width: 120 });
          const base64Image = qrDataUrl.split(';base64,').pop();
          
          if (base64Image) {
            const imageId = workbook.addImage({
              base64: base64Image,
              extension: 'png',
            });

            sheet.addImage(imageId, {
              tl: { col: 4 + 0.1, row: row.number - 1 + 0.1 },
              ext: { width: 90, height: 90 }
            });
            
            row.height = 75;
          }
        } catch (e) {
          console.error("Error generating QR for", eq.id, e);
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="QR_TB_PhongHoc_${new Date().toISOString().slice(0,10)}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
