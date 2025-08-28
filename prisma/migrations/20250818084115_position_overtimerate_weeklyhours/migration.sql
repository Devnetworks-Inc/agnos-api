-- AlterTable
ALTER TABLE `employee_work_log` ADD COLUMN `overtimeRate` DOUBLE NULL,
    ADD COLUMN `overtimeSeconds` INTEGER NULL;

-- AlterTable
ALTER TABLE `position` ADD COLUMN `minimumWeeklyHours` INTEGER NULL,
    ADD COLUMN `overtimeRate` DOUBLE NULL;
