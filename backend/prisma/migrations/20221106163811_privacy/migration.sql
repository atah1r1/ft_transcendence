-- CreateEnum
CREATE TYPE "RoomPrivacy" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "privacy" "RoomPrivacy" NOT NULL DEFAULT 'PUBLIC';
