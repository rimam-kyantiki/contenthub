-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "instagramId" TEXT,
    "instagramUsername" TEXT,
    "accessToken" TEXT,
    "longLivedToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instagramId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caption" TEXT,
    "mediaType" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "permalink" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlogSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'My Blog',
    "description" TEXT NOT NULL DEFAULT 'Welcome to my content hub',
    CONSTRAINT "BlogSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_instagramId_key" ON "User"("instagramId");

-- CreateIndex
CREATE UNIQUE INDEX "User_instagramUsername_key" ON "User"("instagramUsername");

-- CreateIndex
CREATE UNIQUE INDEX "Post_instagramId_key" ON "Post"("instagramId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogSettings_userId_key" ON "BlogSettings"("userId");
