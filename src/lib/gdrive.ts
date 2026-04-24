import { google } from "googleapis"
import { prisma } from "./prisma"
import { Readable } from "stream"

export async function uploadImageToDrive(file: File): Promise<string> {
  const settings = await prisma.setting.findMany({
    where: {
      key: { in: ['DRIVE_CLIENT_EMAIL', 'DRIVE_PRIVATE_KEY', 'DRIVE_FOLDER_ID'] }
    }
  })

  const clientEmail = settings.find(s => s.key === 'DRIVE_CLIENT_EMAIL')?.value
  const privateKeyRaw = settings.find(s => s.key === 'DRIVE_PRIVATE_KEY')?.value
  const folderId = settings.find(s => s.key === 'DRIVE_FOLDER_ID')?.value

  if (!clientEmail || !privateKeyRaw || !folderId) {
    throw new Error("Chưa cấu hình Google Drive trong cài đặt hệ thống.")
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n')

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey
    },
    scopes: ['https://www.googleapis.com/auth/drive']
  })

  const drive = google.drive({ version: 'v3', auth })

  const buffer = Buffer.from(await file.arrayBuffer())
  const stream = Readable.from(buffer)

  try {
    const response = await drive.files.create({
      requestBody: {
        name: `${Date.now()}_${file.name}`,
        parents: [folderId]
      },
      media: {
        mimeType: file.type,
        body: stream
      },
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true // Hỗ trợ Team Drive
    })

    const fileId = response.data.id
    if (fileId) {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        },
        supportsAllDrives: true // Hỗ trợ Team Drive
      })
    }

    return response.data.webContentLink || response.data.webViewLink || ""
  } catch (error) {
    console.error("Lỗi khi tải ảnh lên Google Drive:", error)
    throw new Error("Không thể tải ảnh lên Google Drive. Vui lòng kiểm tra lại cấu hình.")
  }
}

// Hàm kiểm tra kết nối Google Drive (Team Drive)
export async function testDriveConnection(clientEmail: string, privateKeyRaw: string, folderId: string) {
  try {
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n')

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey
      },
      scopes: ['https://www.googleapis.com/auth/drive']
    })

    const drive = google.drive({ version: 'v3', auth })

    // Gọi API để lấy thông tin thư mục
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, capabilities',
      supportsAllDrives: true // Hỗ trợ Team Drive
    })

    // Kiểm tra quyền upload (có thể thêm file mới không)
    const canAddChildren = response.data.capabilities?.canAddChildren
    if (!canAddChildren) {
      return { success: false, message: "Kết nối thành công nhưng Service Account không có quyền thêm File vào thư mục này. Vui lòng cấp quyền 'Người chỉnh sửa'." }
    }

    return { success: true, message: `Kết nối thành công! Thư mục đích: ${response.data.name}` }
  } catch (error: any) {
    console.error("Lỗi khi test kết nối Drive:", error)
    return { success: false, message: error.message || "Lỗi cấu hình Service Account hoặc Folder ID không đúng." }
  }
}
