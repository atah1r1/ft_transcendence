/*
  Warnings:

  - The values [LEFT] on the enum `RoomRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoomRole_new" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
ALTER TABLE "RoomUser" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "RoomUser" ALTER COLUMN "role" TYPE "RoomRole_new" USING ("role"::text::"RoomRole_new");
ALTER TYPE "RoomRole" RENAME TO "RoomRole_old";
ALTER TYPE "RoomRole_new" RENAME TO "RoomRole";
DROP TYPE "RoomRole_old";
ALTER TABLE "RoomUser" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterEnum
ALTER TYPE "RoomUserStatus" ADD VALUE 'LEFT';
