import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      fullName: string;
      roles: string[];
      permissions: string[];
    } & DefaultSession["user"];
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    id: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  }
}
