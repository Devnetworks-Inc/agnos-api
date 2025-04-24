/*
  Warnings:

  - A unique constraint covering the columns `[hotelId,date]` on the table `daily_housekeeping_record` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `daily_housekeeping_record_date_key` ON `daily_housekeeping_record`;

-- CreateIndex
CREATE UNIQUE INDEX `daily_housekeeping_record_hotelId_date_key` ON `daily_housekeeping_record`(`hotelId`, `date`);
