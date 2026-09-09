-- Legacy admin uploads stored full base64 image files inside MySQL. They made
-- catalog responses tens of megabytes and caused Vercel ISR deployment and
-- customer loading failures. CSV-imported HTTP image URLs are not affected.
UPDATE `products`
SET `images` = '["/images/hero_lawn.png"]'
WHERE `images` LIKE '%data:image/%';
