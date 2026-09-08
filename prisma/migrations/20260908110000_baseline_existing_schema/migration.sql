-- Baseline for tables that already existed in the production database before Prisma Migrate.
-- This migration is marked as applied during the first deployment; it is replayed only in Prisma's shadow database.
CREATE TABLE `users` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'user',
  `phone` VARCHAR(191) NULL,
  `address` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `zip` VARCHAR(191) NULL,
  `emailVerified` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `users_email_key`(`email`),
  PRIMARY KEY (`id`)
);

CREATE TABLE `email_verification_otps` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `otpHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `consumedAt` DATETIME(3) NULL,
  `verificationTokenHash` VARCHAR(191) NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `password_reset_otps` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `otpHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `consumedAt` DATETIME(3) NULL,
  `resetTokenHash` VARCHAR(191) NULL,
  `resetTokenExpiresAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `orders` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NOT NULL,
  `city` VARCHAR(191) NOT NULL,
  `zip` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NOT NULL,
  `total` DOUBLE NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Processing',
  `method` VARCHAR(191) NOT NULL DEFAULT 'cod',
  `date` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
);

CREATE TABLE `order_items` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `productName` VARCHAR(191) NOT NULL,
  `qty` INTEGER NOT NULL,
  `size` VARCHAR(191) NULL,
  `color` VARCHAR(191) NULL,
  `unitPrice` DOUBLE NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);
