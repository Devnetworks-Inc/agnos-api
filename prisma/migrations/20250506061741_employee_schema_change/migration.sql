/*
  Warnings:

  - You are about to drop the column `address` on the `employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `employee` DROP COLUMN `address`,
    ADD COLUMN `city` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `minimumWeeklyHours` INTEGER NULL,
    ADD COLUMN `overtimeRate` DOUBLE NULL,
    ADD COLUMN `postalCode` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `street` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `employee_work_log` ADD COLUMN `comment` VARCHAR(191) NULL;
