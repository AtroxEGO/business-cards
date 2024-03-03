/*
  Warnings:

  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cardId,socialName]` on the table `SocialDetail` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fullName` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Made the column `primaryColor` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `secondaryColor` on table `Card` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_id_fkey";

-- DropForeignKey
ALTER TABLE "SocialDetail" DROP CONSTRAINT "SocialDetail_cardId_fkey";

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "fullName" TEXT NOT NULL,
ALTER COLUMN "primaryColor" SET NOT NULL,
ALTER COLUMN "primaryColor" SET DEFAULT '#ffffff',
ALTER COLUMN "secondaryColor" SET NOT NULL,
ALTER COLUMN "secondaryColor" SET DEFAULT '#000000';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fullName";

-- CreateIndex
CREATE UNIQUE INDEX "SocialDetail_cardId_socialName_key" ON "SocialDetail"("cardId", "socialName");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialDetail" ADD CONSTRAINT "SocialDetail_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
