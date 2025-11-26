/*
  Warnings:

  - A unique constraint covering the columns `[whapi_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "whapi_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_whapi_id_key" ON "users"("whapi_id");
