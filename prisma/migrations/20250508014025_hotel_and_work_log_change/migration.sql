-- AlterTable
ALTER TABLE `employee_work_log` ADD COLUMN `totalSecondsBreak` INTEGER NULL;

-- AlterTable
ALTER TABLE `hotel` ADD COLUMN `numberOfRooms` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `roomsCheckingRate` DOUBLE NOT NULL DEFAULT 0;
