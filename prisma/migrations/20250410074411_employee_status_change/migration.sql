-- DropForeignKey
ALTER TABLE `employee_break_log` DROP FOREIGN KEY `employee_break_log_workLogId_fkey`;

-- DropForeignKey
ALTER TABLE `employee_work_log` DROP FOREIGN KEY `employee_work_log_employeeId_fkey`;

-- DropIndex
DROP INDEX `employee_break_log_workLogId_fkey` ON `employee_break_log`;

-- DropIndex
DROP INDEX `employee_work_log_employeeId_fkey` ON `employee_work_log`;

-- AddForeignKey
ALTER TABLE `employee_work_log` ADD CONSTRAINT `employee_work_log_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_break_log` ADD CONSTRAINT `employee_break_log_workLogId_fkey` FOREIGN KEY (`workLogId`) REFERENCES `employee_work_log`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
