/*
  Warnings:

  - You are about to drop the column `aiNotes` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Appointment" DROP COLUMN "aiNotes",
ADD COLUMN     "AI-Notes" TEXT;
