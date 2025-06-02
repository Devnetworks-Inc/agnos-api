-- AlterTable
ALTER TABLE `daily_housekeeping_record` ADD COLUMN `totalCheckedRooms` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `totalCheckedRoomsCost` DECIMAL(10, 2) NOT NULL DEFAULT 0;
