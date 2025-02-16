import esbuild from "esbuild";
import chalk from "chalk";

import path from "path";
import fs from "fs";

import { dtsPlugin } from "esbuild-plugin-d.ts";

const __dirname = path.resolve();

const appendLoaderLogPlugin = {
    name: 'append-loader-log',
    setup(build) {
        build.onLoad({ filter: /\.ts$/ }, async (args) => {
            const contents = await fs.promises.readFile(args.path, 'utf8');
            const relativePath = path.relative(__dirname, args.path);
            const formattedPath = `./${relativePath.replace(/\\/g, '/')}`;
            const loaderLog = `console.log(c.blue("[ ! ] Loaded \\"${formattedPath}\\""));`;
            return {
                contents: contents + '\n' + loaderLog,
                loader: 'ts',
            };
        });
    },
};

console.log(chalk.yellow("❗ Building..."));

esbuild
    .build({
        entryPoints: ["./source/client/main.ts", "./source/server/main.ts"],
        outdir: "./dist",

        bundle: true,
        minifySyntax: true,
        minifyWhitespace: true,
        minifyIdentifiers: false,

        plugins: [appendLoaderLogPlugin, dtsPlugin()],
    })
    .then(() => console.log(chalk.green("✅ Build successful!")))
    .catch((error) => console.error(chalk.red("❌ Build unsuccessful.\nError: " + error)));