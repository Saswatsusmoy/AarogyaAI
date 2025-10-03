-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "recommendedTests" TEXT;

-- AlterTable
ALTER TABLE "public"."DoctorProfile" ADD COLUMN     "clinicAddress" TEXT,
ADD COLUMN     "clinicName" TEXT,
ADD COLUMN     "clinicPhone" TEXT;

-- CreateTable
CREATE TABLE "public"."MedicalTest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicalTest_name_key" ON "public"."MedicalTest"("name");
