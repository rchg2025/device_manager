import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"

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
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        session.user.role = token.role as any
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    }
  }
})
