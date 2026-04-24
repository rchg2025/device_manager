"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendOtpEmail } from "@/lib/email"

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOtpToEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return { error: "Không tìm thấy tài khoản với email này" }
    }

    const otp = generateOTP()
    // Lưu OTP vào VerificationToken. Xóa token cũ nếu có
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires: new Date(Date.now() + 15 * 60 * 1000) // Hết hạn sau 15 phút
      }
    })

    await sendOtpEmail(email, user.name || "Bạn", otp)
    return { success: true }
  } catch (error) {
    console.error("Gửi OTP thất bại", error)
    return { error: "Không thể gửi OTP, vui lòng thử lại sau" }
  }
}

export async function verifyOtp(email: string, otp: string) {
  try {
    const token = await prisma.verificationToken.findFirst({
      where: { identifier: email, token: otp }
    })

    if (!token) {
      return { error: "Mã OTP không hợp lệ" }
    }

    if (token.expires < new Date()) {
      return { error: "Mã OTP đã hết hạn" }
    }

    return { success: true }
  } catch (error) {
    return { error: "Lỗi xác thực OTP" }
  }
}

export async function resetPassword(email: string, otp: string, newPassword: string) {
  try {
    const token = await prisma.verificationToken.findFirst({
      where: { identifier: email, token: otp }
    })

    if (!token || token.expires < new Date()) {
      return { error: "Mã OTP không hợp lệ hoặc đã hết hạn" }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    // Xóa token sau khi dùng
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: otp } }
    })

    return { success: true }
  } catch (error) {
    return { error: "Lỗi khi đổi mật khẩu" }
  }
}
