import { validateImageMagicBytes, uploadImageToStorage, deleteStoredImage } from "../src/lib/image-storage";
import { isValidImageUrl, productWriteData, toProduct } from "../src/lib/product-service";
import { Prisma, Product as DbProduct } from "@prisma/client";

async function runTests() {
  console.log("=== SAWERA COLLECTION: IMAGE PIPELINE TEST SUITE ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Magic Bytes Validation
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const validWebp = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50, // WEBP
    0x56, 0x50, 0x38, 0x20
  ]);
  const invalidFile = Buffer.from("<html><script>alert(1)</script></html>");

  assert(validateImageMagicBytes(validJpeg).valid === true, "JPEG magic bytes detected as valid");
  assert(validateImageMagicBytes(validPng).valid === true, "PNG magic bytes detected as valid");
  assert(validateImageMagicBytes(validWebp).valid === true, "WEBP magic bytes detected as valid");
  assert(validateImageMagicBytes(invalidFile).valid === false, "Malicious/Non-image file rejected by magic bytes");

  // 2. URL Validation Tests
  assert(isValidImageUrl("https://saweracollection.com/images/suit.webp") === true, "Accepts HTTPS external URL");
  assert(isValidImageUrl("http://example.com/photo.jpg") === true, "Accepts HTTP URL");
  assert(isValidImageUrl("/uploads/products/suit-123.webp") === true, "Accepts /uploads/ persistent path");
  assert(isValidImageUrl("/images/hero_lawn.png") === true, "Accepts /images/ static path");

  // Rejections
  assert(isValidImageUrl("blob:http://localhost:3000/123-abc") === false, "Rejects blob: localhost URL");
  assert(isValidImageUrl("blob:https://saweracollection.com/xyz") === false, "Rejects blob: HTTPS URL");
  assert(isValidImageUrl("data:image/jpeg;base64,/9j/4AAQSkZJRg...") === false, "Rejects data:image Base64 string");
  assert(isValidImageUrl("C:\\Users\\admin\\Pictures\\suit.jpg") === false, "Rejects local Windows file path");
  assert(isValidImageUrl("C:\\fakepath\\dress.png") === false, "Rejects browser fakepath string");
  assert(isValidImageUrl("undefined") === false, "Rejects 'undefined' string");
  assert(isValidImageUrl("null") === false, "Rejects 'null' string");
  assert(isValidImageUrl("") === false, "Rejects empty string");

  // 3. Persistent Storage Upload Test
  console.log("\nTesting persistent upload to storage...");
  // Create a minimal 1x1 valid PNG buffer
  const png1x1 = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );

  const uploadResult = await uploadImageToStorage(png1x1, "test-luxury-suit.png", "image/png");
  console.log("Upload result:", uploadResult);

  assert(Boolean(uploadResult.url), "Upload returned a persistent URL");
  assert(uploadResult.url.startsWith("/") || uploadResult.url.startsWith("https://"), "URL is public / persistent");
  assert(!uploadResult.url.startsWith("blob:") && !uploadResult.url.startsWith("data:"), "URL is NOT a blob or data URL");

  // 4. Product Write Data & Sanitization Test
  const testProductInput = {
    slug: "test-luxury-suit",
    name: "Test Luxury Embroidered Suit",
    category: "Luxury Lawn",
    brand: "Sawera Collection",
    price: 8500,
    rating: 5,
    reviews: 1,
    colors: ["Ivory", "Pastel Pink"],
    sizes: ["M", "L"],
    images: [
      uploadResult.url,
      "blob:http://localhost:3000/invalid-blob", // must be stripped
      "data:image/png;base64,invalid", // must be stripped
      "https://example.com/external-model-photo.jpg",
      "C:\\fakepath\\suit.jpg" // must be stripped
    ],
    description: "Handcrafted pure lawn 3pc suit with organza dupatta.",
    fabric: "Pure Lawn",
    stock: 15,
    status: "published" as const,
    isActive: true
  };

  const writeData = productWriteData(testProductInput);
  const parsedImages = JSON.parse(writeData.images as string) as string[];

  assert(Array.isArray(parsedImages), "productWriteData saved images as JSON array");
  assert(parsedImages.length === 2, `Sanitization kept exactly 2 valid images (got ${parsedImages.length})`);
  assert(parsedImages[0] === uploadResult.url, "Primary image is the uploaded persistent URL");
  assert(parsedImages[1] === "https://example.com/external-model-photo.jpg", "Secondary image is external URL");
  assert(!parsedImages.some((img) => img.includes("blob:") || img.includes("data:") || img.includes("fakepath")), "No blob/data/fakepath saved to database payload");

  // 5. Product Read Data / toProduct Transformation
  const mockDbProduct: DbProduct = {
    id: "p-test-01",
    slug: "test-suit",
    name: "Test Suit",
    category: "Luxury Lawn",
    brand: "Sawera Collection",
    price: 8500,
    compareAt: null,
    rating: 5,
    reviews: 1,
    badge: "New",
    colors: JSON.stringify(["Ivory"]),
    sizes: JSON.stringify(["M"]),
    images: JSON.stringify([uploadResult.url, "https://example.com/external.jpg"]),
    description: "Sample description",
    fabric: "Lawn",
    stock: 10,
    salePrice: null,
    saleEnd: null,
    status: "published",
    isActive: true,
    publishedAt: new Date(),
    sku: "SW-01",
    tags: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const transformed = toProduct(mockDbProduct);
  assert(transformed.images.length === 2, "toProduct parses valid images correctly");
  assert(transformed.images[0] === uploadResult.url, "toProduct serves uploaded URL to frontend");

  // 6. Delete / cleanup test
  if (uploadResult.storageProvider === "local") {
    const deleteResult = await deleteStoredImage(uploadResult.url);
    assert(deleteResult === true, "deleteStoredImage cleans up test file");
  }

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
