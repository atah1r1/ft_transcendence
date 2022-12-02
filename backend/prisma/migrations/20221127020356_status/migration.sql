-- CreateEnum
CREATE TYPE "RoomUserStatus" AS ENUM ('NORMAL', 'BANNED', 'MUTED');

-- AlterTable
ALTER TABLE "RoomUser" ADD COLUMN     "status" "RoomUserStatus" NOT NULL DEFAULT 'NORMAL';
