/*
  Warnings:

  - You are about to drop the column `companyId` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `driverId` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `salesmanId` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `touristId` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `transportCompanyId` on the `Trip` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Trip" DROP CONSTRAINT "Trip_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Trip" DROP CONSTRAINT "Trip_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Trip" DROP CONSTRAINT "Trip_salesmanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Trip" DROP CONSTRAINT "Trip_touristId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Trip" DROP CONSTRAINT "Trip_transportCompanyId_fkey";

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "companyId",
DROP COLUMN "driverId",
DROP COLUMN "salesmanId",
DROP COLUMN "touristId",
DROP COLUMN "transportCompanyId";

-- CreateTable
CREATE TABLE "TripUsers" (
    "tripId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "ROLE",

    CONSTRAINT "TripUsers_pkey" PRIMARY KEY ("tripId","userId")
);

-- AddForeignKey
ALTER TABLE "TripUsers" ADD CONSTRAINT "TripUsers_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripUsers" ADD CONSTRAINT "TripUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
