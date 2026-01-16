-- DropForeignKey
ALTER TABLE "party_members" DROP CONSTRAINT "party_members_party_id_fkey";

-- AddForeignKey
ALTER TABLE "party_members" ADD CONSTRAINT "party_members_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
