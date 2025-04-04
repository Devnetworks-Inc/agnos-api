/*
  Warnings:

  - You are about to drop the column `emergycyContactName` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `emergycyContactNumber` on the `employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `employee` DROP COLUMN `emergycyContactName`,
    DROP COLUMN `emergycyContactNumber`,
    ADD COLUMN `emergencyContactName` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `emergencyContactNumber` VARCHAR(191) NOT NULL DEFAULT '';
