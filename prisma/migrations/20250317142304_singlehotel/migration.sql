
-- AlterTable
ALTER TABLE `employee` ADD COLUMN `hotelId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `employee_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `hotel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
