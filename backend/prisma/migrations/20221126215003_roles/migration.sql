/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `RoomUser` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RoomRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "RoomUser" DROP COLUMN "isAdmin",
ADD COLUMN     "role" "RoomRole" NOT NULL DEFAULT 'MEMBER';
