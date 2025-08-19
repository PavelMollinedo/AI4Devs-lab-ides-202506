/*
  Warnings:

  - Made the column `phone` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `resumeUrl` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `education` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstName` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstSurname` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `personalId` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `secondName` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `secondSurname` on table `Candidate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workExperience` on table `Candidate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Candidate" ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "resumeUrl" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "education" SET NOT NULL,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "firstSurname" SET NOT NULL,
ALTER COLUMN "personalId" SET NOT NULL,
ALTER COLUMN "secondName" SET NOT NULL,
ALTER COLUMN "secondSurname" SET NOT NULL,
ALTER COLUMN "workExperience" SET NOT NULL;
