import { google } from "googleapis"
import { prisma } from "./prisma"
import { Readable } from "stream"

export async function uploadImageToDrive(file: File): Promise<string> {
  // Lấy cấu hình từ DB
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

  // Khôi phục ký tự \n trong private key
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n')

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey
    },
    scopes: ['https://www.googleapis.com/auth/drive']
  })

  const drive = google.drive({ version: 'v3', auth })

  // Convert File to stream
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
      fields: 'id, webViewLink, webContentLink'
    })

    const fileId = response.data.id
    if (fileId) {
      // Cấp quyền public cho file
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      })
    }

    // Ưu tiên webContentLink để hiển thị trực tiếp (download link) nhưng WebViewLink cũng hiển thị được trong thẻ img
    // Google Drive webContentLink works well as src for img.
    return response.data.webContentLink || response.data.webViewLink || ""
  } catch (error) {
    console.error("Lỗi khi tải ảnh lên Google Drive:", error)
    throw new Error("Không thể tải ảnh lên Google Drive. Vui lòng kiểm tra lại cấu hình.")
  }
}
