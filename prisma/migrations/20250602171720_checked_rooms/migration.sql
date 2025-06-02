/*
  Warnings:

  - Added the required column `checkedRooms` to the `daily_housekeeping_record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `daily_housekeeping_record` ADD COLUMN `checkedRooms` INTEGER NOT NULL;
