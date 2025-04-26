-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('agnos_admin', 'hsk_manager', 'hsk_staff', 'hotel_manager', 'check_in_assistant') NOT NULL;

-- CreateTable
CREATE TABLE `employee_work_edit_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workLogId` INTEGER NOT NULL,
    `editorId` INTEGER NULL,
    `comment` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee_work_edit_log` ADD CONSTRAINT `employee_work_edit_log_editorId_fkey` FOREIGN KEY (`editorId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_work_edit_log` ADD CONSTRAINT `employee_work_edit_log_workLogId_fkey` FOREIGN KEY (`workLogId`) REFERENCES `employee_work_log`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `employee` AUTO_INCREMENT=100;
