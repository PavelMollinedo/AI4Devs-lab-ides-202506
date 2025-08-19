/*
  Warnings:

  - You are about to drop the column `type` on the `CandidateAddress` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `CandidatePhone` table. All the data in the column will be lost.
  - Added the required column `typeId` to the `CandidateAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeId` to the `CandidatePhone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CandidateAddress" DROP COLUMN "type",
ADD COLUMN     "typeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CandidatePhone" DROP COLUMN "type",
ADD COLUMN     "typeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "PhoneType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PhoneType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddressType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AddressType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhoneType_name_key" ON "PhoneType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AddressType_name_key" ON "AddressType"("name");

-- AddForeignKey
ALTER TABLE "CandidatePhone" ADD CONSTRAINT "CandidatePhone_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "PhoneType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateAddress" ADD CONSTRAINT "CandidateAddress_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AddressType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
