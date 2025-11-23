/*
  Warnings:

  - The primary key for the `TripUsers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Tour" DROP CONSTRAINT "Tour_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TripUsers" DROP CONSTRAINT "TripUsers_userId_fkey";

-- AlterTable
ALTER TABLE "Tour" ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TripUsers" DROP CONSTRAINT "TripUsers_pkey",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TripUsers_pkey" PRIMARY KEY ("tripId", "userId");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ALTER COLUMN "email" DROP NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("auth_id");

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "users"("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripUsers" ADD CONSTRAINT "TripUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;
