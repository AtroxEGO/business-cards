/*
  Warnings:

  - You are about to drop the column `address` on the `Card` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "address";

-- CreateTable
CREATE TABLE "CardVisit" (
    "id" TEXT NOT NULL,
    "cardID" TEXT NOT NULL,
    "originIP" TEXT NOT NULL,
    "requesterID" TEXT,
    "countryCode" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardVisit_pkey" PRIMARY KEY ("id")
);
