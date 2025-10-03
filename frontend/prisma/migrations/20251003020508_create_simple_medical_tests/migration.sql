/*
  Warnings:

  - You are about to drop the `MedicalTest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."MedicalTest";

-- CreateTable
CREATE TABLE "public"."MedicalTests" (
    "TestID" TEXT NOT NULL,
    "TestName" TEXT NOT NULL,

    CONSTRAINT "MedicalTests_pkey" PRIMARY KEY ("TestID")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicalTests_TestName_key" ON "public"."MedicalTests"("TestName");
