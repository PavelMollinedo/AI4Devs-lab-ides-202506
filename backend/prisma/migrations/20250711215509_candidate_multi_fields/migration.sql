/*
  Warnings:

  - You are about to drop the column `address` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Candidate` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Candidate_email_key";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "address",
DROP COLUMN "email",
DROP COLUMN "phone";

-- CreateTable
CREATE TABLE "CandidateEmail" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CandidateEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidatePhone" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CandidatePhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateAddress" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CandidateAddress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CandidateEmail" ADD CONSTRAINT "CandidateEmail_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidatePhone" ADD CONSTRAINT "CandidatePhone_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateAddress" ADD CONSTRAINT "CandidateAddress_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
