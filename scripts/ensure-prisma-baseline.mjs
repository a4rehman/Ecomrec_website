import { spawnSync } from "node:child_process";

const binary = process.platform === "win32" ? "npx.cmd" : "npx";

// List of all migrations that already exist in the DB.
// If Prisma complains P3008 (migration failed) or "already recorded",
// we resolve them as applied so that `prisma migrate deploy` can continue.
const migrations = [
  "20260908110000_baseline_existing_schema",
  "20260908120000_product_publication_state",
  "20260909010000_product_import_metadata",
  "20260909020000_remove_legacy_embedded_product_images",
  "20260925000000_create_home_sliders",
];

for (const migration of migrations) {
  const args = ["prisma", "migrate", "resolve", "--applied", migration];
  const result = spawnSync(binary, args, { encoding: "utf8" });
  const output = `${result.stdout || ""}${result.stderr || ""}`;

  if (
    result.status === 0 ||
    output.includes("P3008") ||
    output.includes("already recorded") ||
    output.includes("already applied")
  ) {
    process.stdout.write(`[baseline] OK: ${migration}\n`);
    continue;
  }

  process.stderr.write(`[baseline] FAILED: ${migration}\n${output}`);
  process.exit(result.status || 1);
}
