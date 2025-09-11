/*
  Warnings:

  - The values [day_off] on the enum `employee_work_log_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [day_off] on the enum `employee_work_log_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `employee_work_log` DROP FOREIGN KEY `employee_work_log_employeeId_fkey`;

-- AlterTable
ALTER TABLE `employee` MODIFY `status` ENUM('checked_in', 'checked_out', 'on_break', 'absent', 'inactive') NOT NULL DEFAULT 'checked_out';

-- AlterTable
ALTER TABLE `employee_work_log` ADD COLUMN `employeeFirstName` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `employeeLastName` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `employeeMiddleName` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `employeeId` INTEGER NULL,
    MODIFY `checkInDate` DATETIME(3) NULL,
    MODIFY `status` ENUM('checked_in', 'checked_out', 'on_break', 'absent', 'inactive') NOT NULL DEFAULT 'checked_out';

-- AddForeignKey
ALTER TABLE `employee_work_log` ADD CONSTRAINT `employee_work_log_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
