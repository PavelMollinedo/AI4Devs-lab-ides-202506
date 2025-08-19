/*
  Warnings:

  - You are about to drop the column `name` on the `Candidate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[personalId]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "name",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "firstSurname" TEXT,
ADD COLUMN     "personalId" TEXT,
ADD COLUMN     "secondName" TEXT,
ADD COLUMN     "secondSurname" TEXT,
ADD COLUMN     "workExperience" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_personalId_key" ON "Candidate"("personalId");
