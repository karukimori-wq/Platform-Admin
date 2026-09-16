import fs from "node:fs";

const files = [".env.example", "lib/connection-test.ts", "lib/plan-readiness.ts"];
const combined = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");

for (const retired of [
  "https://growth-engine-ruby-nine.vercel.app",
  "https://numeria-studio.illusionddt.chatgpt.site"
]) {
  if (combined.includes(retired)) throw new Error(`Retired monitoring URL remains: ${retired}`);
}

const env = fs.readFileSync(".env.example", "utf8");
if (!env.includes("GROWTH_ENGINE_BASE_URL=https://growth-engine.karukimori.workers.dev")) throw new Error("Current Growth Engine Production URL missing");
if (!env.includes("NUMERIA_STUDIO_BASE_URL=https://numeria-studio.com")) throw new Error("Current Numeria Studio Production URL missing");

for (const file of ["lib/connection-test.ts", "lib/plan-readiness.ts"]) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes('baseUrl("NUMERIA_STUDIO_BASE_URL", "https://numeria-studio.com")')) throw new Error(`Current Numeria fallback missing in ${file}`);
}

console.log("Monitoring Production URL defaults verified");
