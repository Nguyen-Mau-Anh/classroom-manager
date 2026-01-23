-- AlterTable
ALTER TABLE "Subject" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Subject_code_idx" ON "Subject"("code");

-- CreateIndex
CREATE INDEX "Subject_isMandatory_idx" ON "Subject"("isMandatory");
