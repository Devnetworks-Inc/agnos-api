-- AlterTable
ALTER TABLE `employee` MODIFY `status` ENUM('check_in', 'check_out', 'on_break') NOT NULL;

-- AlterTable
ALTER TABLE `employee_work_log` ADD COLUMN `totalSeconds` INTEGER NULL;

-- CreateTable
CREATE TABLE `employee_break_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workLogId` INTEGER NOT NULL,
    `breakStartDate` DATETIME(3) NOT NULL,
    `breakEndDate` DATETIME(3) NULL,
    `totalSeconds` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee_break_log` ADD CONSTRAINT `employee_break_log_workLogId_fkey` FOREIGN KEY (`workLogId`) REFERENCES `employee_work_log`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
