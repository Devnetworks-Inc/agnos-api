/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `employee_work_log` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `month` to the `daily_housekeeping_record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `employee_work_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `employee_work_log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `daily_housekeeping_record` ADD COLUMN `approvedByHotelManagerId` INTEGER NULL,
    ADD COLUMN `approvedByHskManagerId` INTEGER NULL,
    ADD COLUMN `hotelManagerApprovedDate` DATETIME(3) NULL,
    ADD COLUMN `hskManagerApprovedDate` DATETIME(3) NULL,
    ADD COLUMN `month` TINYINT UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `employee_work_log` ADD COLUMN `date` DATE NOT NULL,
    ADD COLUMN `month` TINYINT NOT NULL,
    ADD COLUMN `status` ENUM('checked_in', 'checked_out', 'on_break', 'absent', 'day_off') NOT NULL DEFAULT 'checked_out';

-- CreateIndex
CREATE UNIQUE INDEX `employee_work_log_date_key` ON `employee_work_log`(`date`);

-- AddForeignKey
ALTER TABLE `daily_housekeeping_record` ADD CONSTRAINT `daily_housekeeping_record_approvedByHskManagerId_fkey` FOREIGN KEY (`approvedByHskManagerId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_housekeeping_record` ADD CONSTRAINT `daily_housekeeping_record_approvedByHotelManagerId_fkey` FOREIGN KEY (`approvedByHotelManagerId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
