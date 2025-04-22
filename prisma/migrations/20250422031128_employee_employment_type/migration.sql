-- AlterTable
ALTER TABLE `employee` ADD COLUMN `employmentType` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `birthdate` DATE NULL,
    MODIFY `address` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `status` ENUM('checked_in', 'checked_out', 'on_break', 'absent', 'day_off') NOT NULL DEFAULT 'checked_out',
    MODIFY `civilStatus` VARCHAR(191) NOT NULL DEFAULT '';
