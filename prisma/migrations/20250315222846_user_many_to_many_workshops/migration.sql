/*
  Warnings:

  - You are about to drop the column `userId` on the `workshops` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "workshops" DROP CONSTRAINT "workshops_userId_fkey";

-- AlterTable
ALTER TABLE "workshops" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "_UserToWorkshop" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL,

    CONSTRAINT "_UserToWorkshop_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserToWorkshop_B_index" ON "_UserToWorkshop"("B");

-- AddForeignKey
ALTER TABLE "_UserToWorkshop" ADD CONSTRAINT "_UserToWorkshop_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToWorkshop" ADD CONSTRAINT "_UserToWorkshop_B_fkey" FOREIGN KEY ("B") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
