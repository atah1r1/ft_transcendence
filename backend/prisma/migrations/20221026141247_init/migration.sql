-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "avatar" VARCHAR(255),
    "two_factor_auth" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_auth_key" VARCHAR(255),
    "two_factor_auth_uri" VARCHAR(255),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
