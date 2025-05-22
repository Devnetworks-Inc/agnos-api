/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,checkInDate]` on the table `employee_work_log` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `employee_work_log` DROP FOREIGN KEY `employee_work_log_employeeId_fkey`;

-- DropIndex
DROP INDEX `employee_work_log_employeeId_date_key` ON `employee_work_log`;

-- CreateIndex
CREATE UNIQUE INDEX `employee_work_log_employeeId_checkInDate_key` ON `employee_work_log`(`employeeId`, `checkInDate`);

-- AddForeignKey
ALTER TABLE `employee_work_log` ADD CONSTRAINT `employee_work_log_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE `daily_housekeeping_record` ADD CONSTRAINT `daily_housekeeping_record_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
