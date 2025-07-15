-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('agnos_admin', 'hsk_manager', 'hsk_staff', 'hotel_manager', 'check_in_assistant', 'gouvernante', 'public_cleaner') NOT NULL;
