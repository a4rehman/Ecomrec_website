-- Product import metadata. Existing catalog rows remain untouched.
ALTER TABLE `products` ADD COLUMN `sku` VARCHAR(191) NULL;
ALTER TABLE `products` ADD COLUMN `tags` TEXT NULL;
CREATE UNIQUE INDEX `products_sku_key` ON `products`(`sku`);
