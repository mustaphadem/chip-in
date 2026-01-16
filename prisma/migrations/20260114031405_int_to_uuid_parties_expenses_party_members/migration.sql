/*
  Warnings:

  - The primary key for the `expenses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `parties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `party_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `expenses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `partyId` on the `expenses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `parties` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `party_members` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `partyId` on the `party_members` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_partyId_fkey";

-- DropForeignKey
ALTER TABLE "party_members" DROP CONSTRAINT "party_members_partyId_fkey";

-- AlterTable
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "partyId",
ADD COLUMN     "partyId" UUID NOT NULL,
ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "parties" DROP CONSTRAINT "parties_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "parties_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "party_members" DROP CONSTRAINT "party_members_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "partyId",
ADD COLUMN     "partyId" UUID NOT NULL,
ADD CONSTRAINT "party_members_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "party_members_userId_partyId_key" ON "party_members"("userId", "partyId");

-- AddForeignKey
ALTER TABLE "party_members" ADD CONSTRAINT "party_members_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
