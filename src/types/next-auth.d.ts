import NextAuth, { type DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession["user"] & {
  role: "ADMIN" | "MANAGER" | "MEMBER"
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser
  }
}
