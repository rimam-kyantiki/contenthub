// @ts-nocheck
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
      token: {
        url: "https://api.instagram.com/oauth/access_token",
        async request(context: any) {
          const response = await fetch("https://api.instagram.com/oauth/access_token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: context.client.client_id,
              client_secret: context.client.client_secret,
              grant_type: "authorization_code",
              code: context.params.code,
              redirect_uri: context.params.redirect_uri,
            }),
          });
          const tokens = await response.json();
          return { tokens };
        },
      },
      userinfo: {
        url: "https://graph.instagram.com/me",
        async request(context: any) {
          const url = new URL("https://graph.instagram.com/me");
          url.searchParams.set("fields", "id,username,account_type");
          url.searchParams.set("access_token", context.tokens.access_token);
          const response = await fetch(url.toString());
          return await response.json();
        },
      },
      profile(profile: any) {
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
      if (account?.provider === "instagram" && (user as any).instagramId) {
        await db.user.upsert({
          where: { instagramId: (user as any).instagramId },
          update: {
            name: user.name,
            instagramUsername: (user as any).instagramUsername,
            accessToken: account.access_token as string,
          },
          create: {
            instagramId: (user as any).instagramId,
            name: user.name,
            instagramUsername: (user as any).instagramUsername,
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