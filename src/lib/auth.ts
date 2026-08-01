async signIn({ user, account }) {
  if (account?.provider === "instagram" && account.access_token) {
    try {
      // Step 1: Get Facebook Pages managed by this user
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account{username,id}&access_token=${account.access_token}`
      );
      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        console.error("Facebook Pages API error:", pagesData.error);
        return false;
      }

      // Step 2: Find the first page with a linked Instagram Business account
      const pageWithIg = pagesData?.data?.find((p: any) => p.instagram_business_account);
      const igAccount = pageWithIg?.instagram_business_account;

      if (!igAccount) {
        console.error("No Instagram Business account linked. Pages data:", JSON.stringify(pagesData));
        return false;
      }

      // Step 3: Upsert user in database
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