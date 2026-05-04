import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { writeLog } from "@/lib/system-log"

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = "fallback_secret_for_build_only_do_not_use_in_prod"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: '/login',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "placeholder",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "placeholder",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email/Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.email as string },
              { name: credentials.email as string } // username fallback
            ]
          }
        })
        
        if (!user || !user.password) return null
        
        const isMatch = await bcrypt.compare(credentials.password as string, user.password)
        if (!isMatch) return null
        
        return user
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          if (user.email) {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email },
              include: { accounts: true }
            })
            
            if (existingUser) {
              const isLinked = existingUser.accounts.some(acc => acc.provider === account.provider)
              if (!isLinked) {
                await prisma.account.create({
                  data: {
                    userId: existingUser.id,
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token as string,
                    refresh_token: account.refresh_token as string,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token as string,
                    session_state: account.session_state as string,
                  }
                })
              }
            }
          }
        } catch (error) {
          console.error("Lỗi khi link account Google:", error)
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string)
        session.user.role = token.role as any
      }
      return session
    }
  },
  events: {
    async signIn({ user }) {
      if (user && user.id) {
        await writeLog({
          userId: user.id,
          action: 'LOGIN',
          entity: 'member',
          entityId: user.id,
          detail: `Thành viên ${user.name || user.email} đăng nhập vào hệ thống`
        })
      }
    }
  }
})
