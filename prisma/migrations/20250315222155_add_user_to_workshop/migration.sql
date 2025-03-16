-- AlterTable
ALTER TABLE "workshops" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
