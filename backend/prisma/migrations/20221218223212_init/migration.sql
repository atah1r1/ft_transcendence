/*
  Warnings:

  - A unique constraint covering the columns `[intra_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `intra_name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "intra_name" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_intra_name_key" ON "User"("intra_name");
