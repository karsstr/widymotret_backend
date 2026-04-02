-- AlterTable
ALTER TABLE `packages` ADD COLUMN `whatsappLinkType` VARCHAR(191) NOT NULL DEFAULT 'studio',
ADD COLUMN `customWhatsappUrl` VARCHAR(500) NULL;
