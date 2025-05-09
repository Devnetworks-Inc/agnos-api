/*
  Warnings:

  - You are about to drop the column `numberOfRoomNights` on the `daily_housekeeping_record` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `daily_housekeeping_record` DROP COLUMN `numberOfRoomNights`,
    ADD COLUMN `ttcPercent` DOUBLE NOT NULL DEFAULT 0;
