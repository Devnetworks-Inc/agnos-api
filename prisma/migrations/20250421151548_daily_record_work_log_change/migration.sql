/*
  Warnings:

  - You are about to alter the column `month` on the `employee_work_log` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `UnsignedTinyInt`.
  - A unique constraint covering the columns `[employeeId,date]` on the table `employee_work_log` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `year` to the `daily_housekeeping_record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `employee_work_log` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `employee_work_log_date_key` ON `employee_work_log`;

-- AlterTable
ALTER TABLE `daily_housekeeping_record` ADD COLUMN `year` SMALLINT UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `employee` MODIFY `gender` ENUM('male', 'female', 'other') NOT NULL;

-- AlterTable
ALTER TABLE `employee_work_log` ADD COLUMN `year` SMALLINT UNSIGNED NOT NULL,
    MODIFY `date` DATETIME(3) NOT NULL,
    MODIFY `month` TINYINT UNSIGNED NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `employee_work_log_employeeId_date_key` ON `employee_work_log`(`employeeId`, `date`);
