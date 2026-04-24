import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Thêm cột managerId
    await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "managerId" TEXT;`)
    
    // Thêm khóa ngoại (foreign key)
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Category" 
        ADD CONSTRAINT "Category_managerId_fkey" 
        FOREIGN KEY ("managerId") REFERENCES "User"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
      `)
    } catch (e: any) {
      // Bỏ qua lỗi nếu khóa ngoại đã tồn tại
      console.log("Foreign key might already exist:", e.message)
    }

    return NextResponse.json({ success: true, message: "Cập nhật Database thành công!" })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
