-- AlterTable
ALTER TABLE `employee` ADD COLUMN `profilePicId` INTEGER NULL;

-- CreateTable
CREATE TABLE `file` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `fileFor` ENUM('employee_profile_pic', 'employee_file') NOT NULL,
    `employeeId` INTEGER NULL,
    `mimetype` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `folderPath` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `employee_profilePicId_fkey` FOREIGN KEY (`profilePicId`) REFERENCES `file`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `file` ADD CONSTRAINT `file_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
