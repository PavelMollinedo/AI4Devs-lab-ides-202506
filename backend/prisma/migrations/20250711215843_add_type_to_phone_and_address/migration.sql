/*
  Warnings:

  - Added the required column `type` to the `CandidateAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `CandidatePhone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CandidateAddress" ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CandidatePhone" ADD COLUMN     "type" TEXT NOT NULL;
