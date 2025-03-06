/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `DailyHousekeepingRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
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

    UNIQUE INDEX `DailyHousekeepingRecord_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dailyRecordId` INTEGER NOT NULL,
    `serviceName` VARCHAR(191) NOT NULL,
    `totalCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `user_username_key` ON `user`(`username`);

-- AddForeignKey
ALTER TABLE `ServiceEntry` ADD CONSTRAINT `ServiceEntry_dailyRecordId_fkey` FOREIGN KEY (`dailyRecordId`) REFERENCES `DailyHousekeepingRecord`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
