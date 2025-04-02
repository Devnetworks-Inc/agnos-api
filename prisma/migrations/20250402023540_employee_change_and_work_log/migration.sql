/*
  Warnings:

  - You are about to drop the column `contactNumber` on the `employee` table. All the data in the column will be lost.
  - Added the required column `civilStatus` to the `employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `employee` DROP COLUMN `contactNumber`,
    ADD COLUMN `AHVNumber` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `activity` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `bankAccount` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `children` JSON NOT NULL,
    ADD COLUMN `civilStatus` VARCHAR(191) NOT NULL,
    ADD COLUMN `emergycyContactName` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `emergycyContactNumber` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `healthInsurance` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `iban` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `job` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `language` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `mobileNumber` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `nationality` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `profession` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `religion` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `telephoneNumber` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `workPermit` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `workValidUntil` DATETIME(3) NULL,
    MODIFY `email` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `rateType` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `position` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `employee_work_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `checkInDate` DATETIME(3) NOT NULL,
    `checkOutDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee_work_log` ADD CONSTRAINT `employee_work_log_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
