/*
  Warnings:

  - The values [check_in,check_out] on the enum `employee_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `employee` MODIFY `status` ENUM('checked_in', 'checked_out', 'on_break', 'absent', 'day_off') NOT NULL;
