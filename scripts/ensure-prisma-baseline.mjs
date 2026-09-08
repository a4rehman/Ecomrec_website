import { spawnSync } from "node:child_process";

const binary = process.platform === "win32" ? "npx.cmd" : "npx";
const args = ["prisma", "migrate", "resolve", "--applied", "20260908110000_baseline_existing_schema"];
const result = spawnSync(binary, args, { encoding: "utf8" });
const output = `${result.stdout || ""}${result.stderr || ""}`;

if (result.status === 0 || output.includes("P3008") || output.includes("already recorded")) {
  process.stdout.write(output);
  process.exit(0);
}

process.stderr.write(output);
process.exit(result.status || 1);
