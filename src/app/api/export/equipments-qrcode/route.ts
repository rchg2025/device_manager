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
    const nameFilter = searchParams.get('name') || ""
    const categoryFilter = searchParams.get('category') || ""

    const whereClause: any = {}
    if (nameFilter) {
      whereClause.OR = [
        { nameSearch: { contains: normalizeForSearch(nameFilter), mode: 'insensitive' } },
        { barcode: { contains: nameFilter, mode: 'insensitive' } }
      ]
    }
    if (categoryFilter) {
      whereClause.categoryId = categoryFilter
    }

    const equipments = await prisma.equipment.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('MaQR_ThietBiChung');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Tên thiết bị', key: 'name', width: 40 },
      { header: 'Danh mục', key: 'category', width: 25 },
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
        category: eq.category?.name || "Chưa có",
        barcode: eq.barcode || "",
        qr: ''
      });
      
      row.alignment = { vertical: 'middle' };

      if (eq.barcode) {
        try {
          const qrDataUrl = await QRCode.toDataURL(eq.barcode, { margin: 1, width: 120 });
          const base64Image = qrDataUrl.split(';base64,').pop();
          
          if (base64Image) {
            const imageId = workbook.addImage({
              base64: base64Image,
              extension: 'png',
            });

            // Adjust width, height and offsets (so it centers in the cell)
            sheet.addImage(imageId, {
              tl: { col: 4 + 0.1, row: row.number - 1 + 0.1 },
              ext: { width: 90, height: 90 }
            });
            
            row.height = 75;
          }
        } catch (e) {
          console.error("Error generating QR for", eq.barcode, e);
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="QR_ThietBiChung_${new Date().toISOString().slice(0,10)}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
