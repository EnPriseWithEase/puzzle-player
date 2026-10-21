import { cp, mkdir, rm } from "node:fs/promises";

await rm("www", { recursive: true, force: true });

await mkdir("www", { recursive: true });

await cp("index.html", "www/index.html");
await cp("assets", "www/assets", { recursive: true });
await cp("data", "www/data", { recursive: true });
await cp("dist", "www/dist", { recursive: true });

console.log("Web app copied to www/");

