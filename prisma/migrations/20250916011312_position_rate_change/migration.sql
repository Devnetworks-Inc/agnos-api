-- DropForeignKey
ALTER TABLE `employee_work_log` DROP FOREIGN KEY `employee_work_log_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `employee_work_log` DROP FOREIGN KEY `employee_work_log_positionId_fkey`;

-- DropForeignKey
ALTER TABLE `position` DROP FOREIGN KEY `position_employeeId_fkey`;

-- DropIndex
DROP INDEX `employee_work_log_positionId_fkey` ON `employee_work_log`;

-- AlterTable
ALTER TABLE `employee` ADD COLUMN `isInactive` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `employee_break_log` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `employee_work_log` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `position` ADD COLUMN `createdAt` DATETIME(3) NULL,
    ADD COLUMN `isInactive` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `position_rate_change` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `positionId` INTEGER NOT NULL,
    `rate` DOUBLE NOT NULL,
    `effectivityStartDate` DATETIME(3) NOT NULL,
    `effectivityEndDate` DATETIME(3) NULL,
    `effectivityStartYear` SMALLINT UNSIGNED NOT NULL,
    `effectivityStartMonth` SMALLINT UNSIGNED NOT NULL,
    `effectivityStartDay` SMALLINT UNSIGNED NOT NULL,
    `effectivityEndYear` SMALLINT UNSIGNED NULL,
    `effectivityEndMonth` SMALLINT UNSIGNED NULL,
    `effectivityEndDay` SMALLINT UNSIGNED NULL,
    `rateType` VARCHAR(191) NOT NULL,
    `overtimeRate` DOUBLE NULL,
    `minimumWeeklyHours` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `position` ADD CONSTRAINT `position_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `position_rate_change` ADD CONSTRAINT `position_rate_change_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `position`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_work_log` ADD CONSTRAINT `employee_work_log_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_work_log` ADD CONSTRAINT `employee_work_log_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `position`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
