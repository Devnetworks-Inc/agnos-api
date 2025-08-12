-- DropForeignKey
ALTER TABLE `employee_work_log` DROP FOREIGN KEY `employee_work_log_positionId_fkey`;

-- DropIndex
DROP INDEX `employee_work_log_positionId_fkey` ON `employee_work_log`;

-- AlterTable
ALTER TABLE `employee_work_log` ADD COLUMN `role` ENUM('agnos_admin', 'hsk_manager', 'hsk_staff', 'hotel_manager', 'check_in_assistant', 'gouvernante', 'public_cleaner') NULL;

-- AddForeignKey
ALTER TABLE `employee_work_log` ADD CONSTRAINT `employee_work_log_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
