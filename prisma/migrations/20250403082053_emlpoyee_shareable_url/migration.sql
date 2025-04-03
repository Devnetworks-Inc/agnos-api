/*
  Warnings:

  - A unique constraint covering the columns `[shareableUrl]` on the table `employee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `employee` ADD COLUMN `shareableUrl` VARCHAR(191) NULL,
    ADD COLUMN `urlExpiryDate` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `employee_shareableUrl_key` ON `employee`(`shareableUrl`);
