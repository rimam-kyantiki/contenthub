import { NextAuthOptions } from "next-auth";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "instagram",
      name: "Instagram",
      type: "oauth",
      version: "2.0",
      authorization: {
        url: "https://www.instagram.com/oauth/authorize",
        params: {
          scope: "instagram_business_basic",
          response_type: "code",
        },
      },
      token: "https://api.instagram.com/oauth/access_token",
      userinfo: {
        url: "https://graph.instagram.com/me",
        params: {
          fields: "id,username,account_type",
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username,
          email: null,
          image: null,
          instagramId: profile.id,
          instagramUsername: profile.username,
        };
      },
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    },
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "instagram" && user.instagramId) {
        await db.user.upsert({
          where: { instagramId: user.instagramId as string },
          update: {
            name: user.name,
            instagramUsername: user.instagramUsername as string,
            accessToken: account.access_token as string,
          },
          create: {
            instagramId: user.instagramId as string,
            name: user.name,
            instagramUsername: user.instagramUsername as string,
            accessToken: account.access_token as string,
            blogSettings: {
              create: {
                title: `${user.name}'s Blog`,
                description: "All my Instagram content in one place",
              },
            },
          },
        });
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        const user = await db.user.findUnique({
          where: { id: token.sub },
        });
        if (user) {
          (session.user as any).id = user.id;
          (session.user as any).instagramUsername = user.instagramUsername;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};