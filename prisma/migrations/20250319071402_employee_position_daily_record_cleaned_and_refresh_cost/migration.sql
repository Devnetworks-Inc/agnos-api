/*
  Warnings:

  - You are about to drop the `_employeetohotel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `position` to the `employee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_employeeTohotel` DROP FOREIGN KEY `_employeeTohotel_A_fkey`;

-- DropForeignKey
ALTER TABLE `_employeeTohotel` DROP FOREIGN KEY `_employeeTohotel_B_fkey`;

-- AlterTable
ALTER TABLE `daily_housekeeping_record` ADD COLUMN `totalCleanedRoomsCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `totalRefreshRoomsCost` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `employee` ADD COLUMN `position` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `_employeeTohotel`;
