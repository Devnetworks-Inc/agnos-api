-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `user_employeeId_fkey`;

-- DropIndex
DROP INDEX `user_employeeId_key` ON `user`;

-- AlterTable
ALTER TABLE `employee_work_log` ADD COLUMN `positionId` INTEGER NULL;

-- CreateTable
CREATE TABLE `position` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `role` ENUM('agnos_admin', 'hsk_manager', 'hsk_staff', 'hotel_manager', 'check_in_assistant', 'gouvernante', 'public_cleaner') NOT NULL,
    `rate` DOUBLE NOT NULL DEFAULT 0,
    `rateType` VARCHAR(191) NOT NULL DEFAULT 'hourly',

    UNIQUE INDEX `position_userId_key`(`userId`),
    UNIQUE INDEX `position_employeeId_role_key`(`employeeId`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `position` ADD CONSTRAINT `position_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `position` ADD CONSTRAINT `position_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_work_log` ADD CONSTRAINT `employee_work_log_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `position`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;