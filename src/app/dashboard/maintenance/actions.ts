"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createMaintenance(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    throw new Error("Unauthorized")
  }

  const equipmentId = formData.get("equipmentId") as string
  const description = formData.get("description") as string
  const cost = parseFloat(formData.get("cost") as string || "0")
  const status = formData.get("status") as string
  const dateStr = formData.get("date") as string

  if (!equipmentId || !description) return { error: "Thiếu thông tin bắt buộc" }

  const date = dateStr ? new Date(dateStr) : new Date()

  await prisma.maintenance.create({
    data: {
      equipmentId,
      description,
      cost,
      status,
      date
    }
  })

  revalidatePath("/dashboard/maintenance")
  revalidatePath("/dashboard/equipments")
  return { success: true }
}

export async function updateMaintenanceStatus(id: string, status: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    throw new Error("Unauthorized")
  }

  await prisma.maintenance.update({
    where: { id },
    data: { status }
  })

  revalidatePath("/dashboard/maintenance")
}

export async function deleteMaintenance(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  await prisma.maintenance.delete({ where: { id } })
  revalidatePath("/dashboard/maintenance")
}
