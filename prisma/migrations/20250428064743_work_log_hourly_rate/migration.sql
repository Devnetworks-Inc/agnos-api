/*
  Warnings:

  - Added the required column `hourlyRate` to the `employee_work_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate` to the `employee_work_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rateType` to the `employee_work_log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `employee_work_log` ADD COLUMN `hourlyRate` DECIMAL(8, 2) NOT NULL,
    ADD COLUMN `rate` DOUBLE NOT NULL,
    ADD COLUMN `rateType` VARCHAR(191) NOT NULL,
    ADD COLUMN `salaryToday` DECIMAL(10, 2) NOT NULL DEFAULT 0;
