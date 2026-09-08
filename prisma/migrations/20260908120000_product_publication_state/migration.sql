-- Safe for a new production database and non-destructive for an existing catalog.
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `brand` VARCHAR(191) NOT NULL,
  `price` DOUBLE NOT NULL,
  `compareAt` DOUBLE NULL,
  `rating` DOUBLE NOT NULL DEFAULT 5.0,
  `reviews` INTEGER NOT NULL DEFAULT 1,
  `badge` VARCHAR(191) NULL,
  `colors` TEXT NOT NULL,
  `sizes` TEXT NOT NULL,
  `images` LONGTEXT NOT NULL,
  `description` LONGTEXT NOT NULL,
  `fabric` VARCHAR(191) NOT NULL,
  `stock` INTEGER NOT NULL DEFAULT 10,
  `salePrice` DOUBLE NULL,
  `saleEnd` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'published',
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `publishedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `products_slug_key`(`slug`),
  PRIMARY KEY (`id`)
);

-- MySQL 8+ safe upgrades for a catalog table created by an earlier deployment.
ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(191) NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS `isActive` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS `publishedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);
