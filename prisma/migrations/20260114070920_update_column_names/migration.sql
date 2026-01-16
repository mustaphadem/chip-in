/*
  Warnings:

  - You are about to drop the column `createdAt` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `partyId` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `payerId` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `parties` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `parties` table. All the data in the column will be lost.
  - You are about to drop the column `partyId` on the `party_members` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `party_members` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,party_id]` on the table `party_members` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `party_id` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payer_id` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by_id` to the `parties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `party_id` to the `party_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `party_members` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_partyId_fkey";

-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_payerId_fkey";

-- DropForeignKey
ALTER TABLE "parties" DROP CONSTRAINT "parties_createdById_fkey";

-- DropForeignKey
ALTER TABLE "party_members" DROP CONSTRAINT "party_members_partyId_fkey";

-- DropForeignKey
ALTER TABLE "party_members" DROP CONSTRAINT "party_members_userId_fkey";

-- DropIndex
DROP INDEX "party_members_userId_partyId_key";

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "createdAt",
DROP COLUMN "partyId",
DROP COLUMN "payerId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "party_id" UUID NOT NULL,
ADD COLUMN     "payer_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "parties" DROP COLUMN "createdAt",
DROP COLUMN "createdById",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "party_members" DROP COLUMN "partyId",
DROP COLUMN "userId",
ADD COLUMN     "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "left_at" TIMESTAMP(3),
ADD COLUMN     "party_id" UUID NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "party_members_user_id_party_id_key" ON "party_members"("user_id", "party_id");

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_members" ADD CONSTRAINT "party_members_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_members" ADD CONSTRAINT "party_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
