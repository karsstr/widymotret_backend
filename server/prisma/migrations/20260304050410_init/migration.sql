/*
  Warnings:

  - Added the required column `category` to the `packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `packages` ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `images` JSON NULL;
