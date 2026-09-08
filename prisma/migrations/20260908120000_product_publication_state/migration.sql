-- Existing products stay public after the migration through these safe defaults.
ALTER TABLE `products`
  ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'published',
  ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `publishedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);
