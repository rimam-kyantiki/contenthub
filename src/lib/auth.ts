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
        url: "https://www.facebook.com/v18.0/dialog/oauth",
        params: {
          scope: "instagram_basic",
          response_type: "code",
        },
      },
      token: {
        async request(context: any) {
          const url = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
          url.searchParams.set("client_id", String(context.client.client_id));
          url.searchParams.set("client_secret", String(context.client.client_secret));
          url.searchParams.set("grant_type", "authorization_code");
          url.searchParams.set("code", String(context.params.code));
          url.searchParams.set("redirect_uri", String(context.params.redirect_uri));

          const response = await fetch(url.toString());
          const tokens = await response.json();

          if (tokens.error) {
            throw new Error(`Facebook token error: ${JSON.stringify(tokens.error)}`);
          }

          return { tokens };
        },
      },
      userinfo: {
        async request(context: any) {
          const url = new URL("https://graph.facebook.com/v18.0/me");
          url.searchParams.set("fields", "id,name");
          url.searchParams.set("access_token", context.tokens.access_token);
          const response = await fetch(url.toString());
          return await response.json();
        },
      },
      profile(profile: any) {
        return {
          id: profile.id,
          name: profile.name,
          email: null,
          image: null,
          instagramId: null,
          instagramUsername: null,
        };
      },
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    },
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "instagram" && account.access_token) {
        try {
          // Fetch the Instagram Business account linked to this Facebook user
          const igResponse = await fetch(
            `https://graph.facebook.com/v18.0/me?fields=instagram_business_account{username,id}&access_token=${account.access_token}`
          );
          const igData = await igResponse.json();
          const igAccount = igData?.instagram_business_account;

          if (!igAccount) {
            console.error("No Instagram Business account linked to this Facebook user.");
            return false;
          }

          // Upsert user in database using instagramId
          const dbUser = await db.user.upsert({
            where: { instagramId: igAccount.id },
            update: {
              name: igAccount.username,
              instagramUsername: igAccount.username,
              accessToken: account.access_token,
            },
            create: {
              instagramId: igAccount.id,
              name: igAccount.username,
              instagramUsername: igAccount.username,
              accessToken: account.access_token,
              blogSettings: {
                create: {
                  title: `${igAccount.username}'s Blog`,
                  description: "All my Instagram content in one place",
                },
              },
            },
          });

          // Pass the database ID forward so JWT/session work correctly
          (user as any).dbId = dbUser.id;
          (user as any).instagramId = igAccount.id;
          (user as any).instagramUsername = igAccount.username;
          user.name = igAccount.username;
        } catch (error) {
          console.error("SignIn callback error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && (user as any).dbId) {
        token.sub = (user as any).dbId;
      }
      return token;
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
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};