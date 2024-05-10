-- AlterTable
ALTER TABLE "User" ADD COLUMN     "externalId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
