-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "jobTitle" TEXT,
    "address" TEXT,
    "photoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "bio" TEXT,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialDetail" (
    "cardId" TEXT NOT NULL,
    "socialName" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SocialDetail_pkey" PRIMARY KEY ("cardId")
);

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialDetail" ADD CONSTRAINT "SocialDetail_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
