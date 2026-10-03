CREATE TABLE IF NOT EXISTS `home_sliders` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `selectedImage` VARCHAR(500) NULL,
  `sliderOrder` INTEGER NOT NULL DEFAULT 0,
  `tagline` VARCHAR(191) NULL,
  `title` VARCHAR(191) NULL,
  `description` TEXT NULL,
  `ctaText` VARCHAR(191) NULL,
  `ratingText` VARCHAR(191) NULL,
  `objectPosition` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
);
