import esbuild from "esbuild";
import chalk from "chalk";

import path from "path";
import { dtsPlugin } from "esbuild-plugin-d.ts";

const __dirname = path.resolve();

console.log(chalk.yellow("❗ Building..."));

esbuild
    .build({
        entryPoints: ["./source/client/main.ts"],
        outfile: "./dist/client.bundle.js",

        bundle: true,
        external: ["esbuild", "chalk"],

        platform: "node",
        format: "cjs",

        plugins: [dtsPlugin({ tsconfig: path.join(__dirname, "./source/client/tsconfig.json") })],
    })
    .then(() => console.log(chalk.green("✅ [ds-build] Client build successful!")))
    .catch((error) => console.error(chalk.red("❌ [ds-build] Client build unsuccessful.\nError: " + error)));

esbuild
    .build({
        entryPoints: ["./source/server/main.ts"],
        outfile: "./dist/server.bundle.js",

        bundle: true,
        external: ["esbuild", "chalk"],

        platform: "node",
        format: "cjs",

        plugins: [dtsPlugin({ tsconfig: path.join(__dirname, "./source/server/tsconfig.json") })],
    })
    .then(() => console.log(chalk.green("✅ [ds-build] Server build successful!")))
    .catch((error) => console.error(chalk.red("❌ [ds-build] Server build unsuccessful.\nError: " + error)));