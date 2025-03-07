/*
  Warnings:

  - You are about to drop the `dailyhousekeepingrecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `serviceentry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ServiceEntry` DROP FOREIGN KEY `ServiceEntry_dailyRecordId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `currentHotelId` INTEGER NULL;

-- DropTable
DROP TABLE `DailyHousekeepingRecord`;

-- DropTable
DROP TABLE `ServiceEntry`;

-- CreateTable
CREATE TABLE `hotel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `roomsCleaningRate` DOUBLE NOT NULL,
    `roomsRefreshRate` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_housekeeping_record` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hotelId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `occupancyPercentage` DOUBLE NOT NULL,
    `numberOfRoomNights` INTEGER NOT NULL,
    `departureRooms` INTEGER NOT NULL,
    `stayOverRooms` INTEGER NOT NULL,
    `dirtyRoomsLastDay` INTEGER NOT NULL,
    `dayUseRooms` INTEGER NOT NULL,
    `extraCleaningRooms` INTEGER NOT NULL,
    `noServiceRooms` INTEGER NOT NULL,
    `lateCheckoutRooms` INTEGER NOT NULL,
    `refreshRooms` INTEGER NOT NULL,
    `roomsCarryover` INTEGER NOT NULL,
    `totalCleanedRooms` INTEGER NOT NULL DEFAULT 0,
    `totalRefreshRooms` INTEGER NOT NULL DEFAULT 0,
    `totalHousekeepingManagerCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `totalHousekeepingCleanerCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `daily_housekeeping_record_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dailyRecordId` INTEGER NOT NULL,
    `serviceName` VARCHAR(191) NOT NULL,
    `totalCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_employeeTohotel` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_employeeTohotel_AB_unique`(`A`, `B`),
    INDEX `_employeeTohotel_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_currentHotelId_fkey` FOREIGN KEY (`currentHotelId`) REFERENCES `hotel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_housekeeping_record` ADD CONSTRAINT `daily_housekeeping_record_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_entry` ADD CONSTRAINT `service_entry_dailyRecordId_fkey` FOREIGN KEY (`dailyRecordId`) REFERENCES `daily_housekeeping_record`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_employeeTohotel` ADD CONSTRAINT `_employeeTohotel_A_fkey` FOREIGN KEY (`A`) REFERENCES `employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_employeeTohotel` ADD CONSTRAINT `_employeeTohotel_B_fkey` FOREIGN KEY (`B`) REFERENCES `hotel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
