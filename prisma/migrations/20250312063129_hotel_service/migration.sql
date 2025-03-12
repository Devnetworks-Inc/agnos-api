/*
  Warnings:

  - You are about to drop the column `roomsCarryover` on the `daily_housekeeping_record` table. All the data in the column will be lost.
  - Added the required column `roomsCarryOver` to the `daily_housekeeping_record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `daily_housekeeping_record` DROP COLUMN `roomsCarryover`,
    ADD COLUMN `roomsCarryOver` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `employee` ADD COLUMN `status` ENUM('check_in', 'check_out') NOT NULL;

-- AlterTable
ALTER TABLE `service_entry` ADD COLUMN `hotelServiceId` INTEGER NULL;

-- CreateTable
CREATE TABLE `service` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_service` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serviceId` INTEGER NOT NULL,
    `hotelId` INTEGER NOT NULL,
    `serviceRate` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hotel_service_serviceId_hotelId_key`(`serviceId`, `hotelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hotel_service` ADD CONSTRAINT `hotel_service_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hotel_service` ADD CONSTRAINT `hotel_service_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_entry` ADD CONSTRAINT `service_entry_hotelServiceId_fkey` FOREIGN KEY (`hotelServiceId`) REFERENCES `hotel_service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
