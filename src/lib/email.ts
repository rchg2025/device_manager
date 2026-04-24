import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

async function getTransporter() {
  const settings = await prisma.setting.findMany({
    where: { key: { startsWith: "SMTP_" } }
  })
  const config: Record<string, string> = {}
  settings.forEach(s => { config[s.key] = s.value })

  if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
    console.log("SMTP Config missing. Email not sent.")
    return null
  }

  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: parseInt(config.SMTP_PORT || "465"),
    secure: parseInt(config.SMTP_PORT || "465") === 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS
    }
  })
}

async function getFromAddress() {
  const setting = await prisma.setting.findUnique({ where: { key: "SMTP_FROM" } })
  return setting?.value || "Device Manager ITE <noreply@nsg.edu.vn>"
}

const emailWrapper = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background: #2563eb; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 24px; text-align: center; }
    .footer { padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; background: #f9fafb; }
    .highlight { font-weight: bold; color: #1e40af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      Email tự động từ hệ thống Device Manager ITE.<br>
      Khoa CNTT - KTĐ.
    </div>
  </div>
</body>
</html>
`

export async function sendBorrowRequestEmailToAdmins(
  adminEmails: string[], 
  memberName: string, 
  items: Array<{ name: string, image?: string, quantity: number, borrowDate: string | Date, returnDate: string | Date }>
) {
  const transporter = await getTransporter()
  if (!transporter || adminEmails.length === 0) return

  const from = await getFromAddress()
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://qltb.ite.id.vn"
  
  const itemsHtml = items.map(item => {
    let imgUrl = item.image;
    if (imgUrl?.includes('drive.google.com/uc?')) {
      try {
        const fileId = new URL(imgUrl).searchParams.get('id');
        if (fileId) imgUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
      } catch (e) {}
    }

    const imgTag = imgUrl 
      ? `<img src="${imgUrl}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb; display: block; margin: 0 auto;" />`
      : `<div style="width: 48px; height: 48px; background: #f3f4f6; border-radius: 4px; display: inline-block; border: 1px solid #e5e7eb; line-height: 48px; text-align: center; color: #9ca3af; font-size: 10px; margin: 0 auto;">N/A</div>`;

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${imgTag}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle;"><strong>${item.name}</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle; font-weight: bold;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle; font-size: 13px; color: #4b5563;">
          <div style="margin-bottom: 4px;">${new Date(item.borrowDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</div>
          <div style="color: #9ca3af; font-size: 11px;">đến</div>
          <div style="margin-top: 4px;">${new Date(item.returnDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</div>
        </td>
      </tr>
    `
  }).join('')

  const content = `
    <p>Xin chào Ban Quản Lý,</p>
    <p>Hệ thống vừa nhận được một yêu cầu mượn thiết bị mới từ thành viên <span class="highlight">${memberName}</span>.</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; font-family: sans-serif;">
      <thead style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
        <tr>
          <th style="padding: 12px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase;">Ảnh</th>
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Thiết bị</th>
          <th style="padding: 12px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase;">SL</th>
          <th style="padding: 12px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase;">Thời gian</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <p>Vui lòng truy cập hệ thống để xem chi tiết và phê duyệt yêu cầu này.</p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${domain}/dashboard/requests?filter=action_required" class="button">Xem Yêu Cầu</a>
    </div>
  `

  await transporter.sendMail({
    from,
    to: adminEmails.join(", "),
    subject: `[Device Manager ITE] Yêu cầu mượn thiết bị mới từ ${memberName}`,
    html: emailWrapper("Yêu Cầu Mượn Thiết Bị Mới", content)
  })
}

export async function sendReturnRequestEmailToAdmins(adminEmails: string[], memberName: string, equipmentName: string) {
  const transporter = await getTransporter()
  if (!transporter || adminEmails.length === 0) return

  const from = await getFromAddress()
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://qltb.ite.id.vn"
  
  const content = `
    <p>Xin chào Ban Quản Lý,</p>
    <p>Thành viên <span class="highlight">${memberName}</span> vừa gửi yêu cầu TRẢ thiết bị: <strong>${equipmentName}</strong>.</p>
    <p>Vui lòng kiểm tra tình trạng thiết bị thực tế và xác nhận trả trên hệ thống.</p>
    <div style="text-align: center;">
      <a href="${domain}/dashboard/requests?filter=action_required" class="button">Xác Nhận Trả Thiết Bị</a>
    </div>
  `

  await transporter.sendMail({
    from,
    to: adminEmails.join(", "),
    subject: `[Device Manager ITE] Yêu cầu trả thiết bị từ ${memberName}`,
    html: emailWrapper("Yêu Cầu Trả Thiết Bị", content)
  })
}

export async function sendOtpEmail(email: string, userName: string, otp: string) {
  const transporter = await getTransporter()
  
  const content = `
    <p>Xin chào ${userName},</p>
    <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản trên hệ thống Quản lý Thiết bị ITE.</p>
    <p>Mã xác thực (OTP) của bạn là:</p>
    <div style="margin: 24px 0; text-align: center;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #bfdbfe;">
        ${otp}
      </span>
    </div>
    <p>Mã này có hiệu lực trong vòng <strong>15 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
  `
  
  const emailHtml = emailWrapper("Mã Xác Thực (OTP) Đặt Lại Mật Khẩu", content)

  if (transporter) {
    await transporter.sendMail({
      from: await getFromAddress(),
      to: email,
      subject: `[Device Manager] Mã xác thực (OTP) đặt lại mật khẩu`,
      html: emailHtml
    })
  }
}

export async function sendStatusUpdateEmailToMember(memberEmail: string, equipmentName: string, status: "APPROVED" | "REJECTED" | "RETURNED", reason?: string) {
  const transporter = await getTransporter()
  if (!transporter || !memberEmail) return

  const from = await getFromAddress()
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://qltb.ite.id.vn"
  
  let title = ""
  let statusText = ""
  let color = ""

  switch (status) {
    case "APPROVED":
      title = "Yêu Cầu Đã Được Duyệt"
      statusText = "ĐÃ ĐƯỢC DUYỆT"
      color = "#16a34a"
      break
    case "REJECTED":
      title = "Yêu Cầu Bị Từ Chối"
      statusText = "BỊ TỪ CHỐI"
      color = "#dc2626"
      break
    case "RETURNED":
      title = "Xác Nhận Đã Trả Thiết Bị"
      statusText = "ĐÃ NHẬN TRẢ"
      color = "#2563eb"
      break
  }
  
  let content = `
    <p>Xin chào,</p>
    <p>Yêu cầu mượn/trả thiết bị <strong>${equipmentName}</strong> của bạn đã được cập nhật trạng thái thành: <strong style="color: ${color};">${statusText}</strong>.</p>
  `

  if (reason && status === "REJECTED") {
    content += `<p style="background: #fee2e2; padding: 12px; border-left: 4px solid #dc2626; border-radius: 4px; margin-top: 16px;"><strong>Lý do từ chối:</strong> ${reason}</p>`
  }
  if (reason && status === "RETURNED") {
    content += `<p style="background: #f3f4f6; padding: 12px; border-left: 4px solid #4b5563; border-radius: 4px; margin-top: 16px;"><strong>Tình trạng lúc trả:</strong> ${reason}</p>`
  }

  content += `
    <div style="text-align: center;">
      <a href="${domain}/dashboard/requests" class="button">Xem Lịch Sử</a>
    </div>
  `

  await transporter.sendMail({
    from,
    to: memberEmail,
    subject: `[Device Manager ITE] Trạng thái thiết bị: ${statusText}`,
    html: emailWrapper(title, content)
  })
}

export async function sendBorrowRequestEmailToMember(
  memberEmail: string, 
  memberName: string, 
  items: Array<{ name: string, image?: string, quantity: number, borrowDate: string | Date, returnDate: string | Date }>
) {
  const transporter = await getTransporter()
  if (!transporter || !memberEmail) return

  const from = await getFromAddress()
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://qltb.ite.id.vn"
  
  const itemsHtml = items.map(item => {
    let imgUrl = item.image;
    if (imgUrl?.includes('drive.google.com/uc?')) {
      try {
        const fileId = new URL(imgUrl).searchParams.get('id');
        if (fileId) imgUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
      } catch (e) {}
    }

    const imgTag = imgUrl 
      ? `<img src="${imgUrl}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb; display: block; margin: 0 auto;" />`
      : `<div style="width: 48px; height: 48px; background: #f3f4f6; border-radius: 4px; display: inline-block; border: 1px solid #e5e7eb; line-height: 48px; text-align: center; color: #9ca3af; font-size: 10px; margin: 0 auto;">N/A</div>`;

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${imgTag}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle;"><strong>${item.name}</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle; font-weight: bold;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle; font-size: 13px; color: #4b5563;">
          <div style="margin-bottom: 4px;">${new Date(item.borrowDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</div>
          <div style="color: #9ca3af; font-size: 11px;">đến</div>
          <div style="margin-top: 4px;">${new Date(item.returnDate).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</div>
        </td>
      </tr>
    `
  }).join('')

  const content = `
    <p>Xin chào <span class="highlight">${memberName}</span>,</p>
    <p>Yêu cầu mượn thiết bị của bạn đã được gửi thành công. Vui lòng chờ Quản lý phê duyệt.</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; font-family: sans-serif;">
      <thead style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
        <tr>
          <th style="padding: 12px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase;">Ảnh</th>
          <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Thiết bị</th>
          <th style="padding: 12px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase;">SL</th>
          <th style="padding: 12px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase;">Thời gian</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${domain}/dashboard/requests" class="button">Xem Yêu Cầu Của Bạn</a>
    </div>
  `

  await transporter.sendMail({
    from,
    to: memberEmail,
    subject: `[Device Manager ITE] Xác nhận gửi yêu cầu mượn thiết bị`,
    html: emailWrapper("Yêu Cầu Mượn Thiết Bị Đã Gửi", content)
  })
}

export async function sendReturnRequestEmailToMember(memberEmail: string, memberName: string, equipmentName: string) {
  const transporter = await getTransporter()
  if (!transporter || !memberEmail) return

  const from = await getFromAddress()
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://qltb.ite.id.vn"
  
  const content = `
    <p>Xin chào <span class="highlight">${memberName}</span>,</p>
    <p>Bạn vừa gửi yêu cầu TRẢ thiết bị: <strong>${equipmentName}</strong> thành công.</p>
    <p>Vui lòng mang thiết bị đến gặp Quản lý để kiểm tra tình trạng và xác nhận trả trên hệ thống.</p>
    <div style="text-align: center;">
      <a href="${domain}/dashboard/requests" class="button">Xem Lịch Sử</a>
    </div>
  `

  await transporter.sendMail({
    from,
    to: memberEmail,
    subject: `[Device Manager ITE] Xác nhận gửi yêu cầu trả thiết bị`,
    html: emailWrapper("Yêu Cầu Trả Thiết Bị Đã Gửi", content)
  })
}
