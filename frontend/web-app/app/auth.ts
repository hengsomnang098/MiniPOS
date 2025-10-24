import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { User as NextAuthUser } from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        if (!res.ok) return null;
        const data = await res.json();

        if (!data?.accessToken) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
          roles: data.user.roles,
          permissions: data.user.permissions,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as NextAuthUser & {
          accessToken: string;
          refreshToken: string;
          expiresIn: string;
          roles: string[];
          permissions: string[];
          fullName: string;
        };

        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.expiresIn = u.expiresIn;

        token.user = {
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          roles: u.roles,
          permissions: u.permissions,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          expiresIn: u.expiresIn,
        } as {
          id: string;
          email: string;
          fullName: string;
          roles: string[];
          permissions: string[];
          accessToken: string;
          refreshToken: string;
          expiresIn: string;
        };
      }

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.expiresIn = token.expiresIn as string;

      session.user = {
        ...(token.user || {}),
        emailVerified: null,
      } as {
        id: string;
        email: string;
        fullName: string;
        roles: string[];
        permissions: string[];
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
        emailVerified: Date | null;
      };

      return session;
    },
  },
});
