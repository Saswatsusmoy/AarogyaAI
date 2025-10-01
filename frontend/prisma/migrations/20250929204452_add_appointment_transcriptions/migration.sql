/*
  Warnings:

  - You are about to drop the column `transcriptions` on the `PatientProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."PatientProfile" DROP COLUMN "transcriptions";

-- CreateTable
CREATE TABLE "public"."AppointmentTranscription" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentTranscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AppointmentTranscription" ADD CONSTRAINT "AppointmentTranscription_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
