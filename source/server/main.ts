/**
 * ds-boilerplate
 * server/main.ts
 */

import chalk from "chalk";
import esbuild from "esbuild";
import path from "path";
import { Config } from "./config/Config";

console.log(chalk.blue("✅ Build script loaded."));

function isRecord(value: Array<string> | Object | Record<string, string> | undefined): boolean {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

async function buildConfig(resource: string, config: esbuild.BuildOptions): Promise<esbuild.BuildResult<esbuild.BuildOptions> | undefined> {
	const c = new Config(config);
	const resourcePath = GetResourcePath(resource);

	c.computeEntrypoints(resourcePath);
	c.computePlugins(resourcePath);

	const result = await esbuild.build(c.config);
	return result;
}

async function performBuild(resource: string, cb: (success: boolean, status: string) => void) {
	const numMetaData = GetNumResourceMetadata(resource, "esbuild_config");
	let error = false;

	for (let i = 0; i < numMetaData; i++) {
		const configName = GetResourceMetadata(resource, "esbuild_config", i);
		console.log(chalk.yellow(`❗ Found resource "${resource}" requesting bundling.`));
		console.log(chalk.yellow(`❗ Config name: ${configName}`));

		// TODO: in future, perform checksum calculation on file, and compare with previous checksum.
		// TODO: if the checksum is the same, do not build again
		// Compute the absolute path
		// const configAbsPath = path.join(GetResourcePath(resource), configName);
		// // Also compute a relative path to the CWD for logging
		// const configRelPath = path.relative(process.cwd(), configAbsPath);
		const configPath = path.join(GetResourcePath(resource), configName);
		console.log(chalk.yellow(`[ ! ] Computed config path: ${configPath}`));

		const config = await require(configPath);

		if (!config || !Object.keys(config).length) {
			console.error(chalk.red("❌  Failed to load build script, continuing..."));
			console.error(chalk.red("Contents of the build script: " + config));
			continue;
		}

		const buildScripts: esbuild.BuildOptions | esbuild.BuildOptions[] = Array.isArray(config) && Object.keys(config).length > 1 ? [...config] : [config];
		for (const config of buildScripts) {
			console.log(chalk.yellow(`❗ ${resource} Building...`));
			
			if (!config.entryPoints) {
				console.error(chalk.red(`❌  [${resource}] No entrypoints found, continuing...`));
				continue;
			}
			
			const result = await buildConfig(resource, config);

			if (!result || result.errors.length > 0) {
				console.error(chalk.red(`❌  [${resource} - ${config.entryPoints}] Build unsuccessful.\nError: ${result?.errors.toString()}`));
				error = true;
			} else {
				console.log(chalk.green(`✅ [${resource} - ${config.entryPoints}] Build successful!`));
			}
		}
	}

	cb(error, error ? "Build unsuccessful" : "Build successful");
}

function shouldBuild(resource: string) {
	const numMetaData = GetNumResourceMetadata(resource, "esbuild_config");
	console.log(`❗Found ${numMetaData} resources requesting bundling.`);

	if (!numMetaData) // No resources are requesting to be built.
		return false;

	return true;
}

const buildOptions = {
	shouldBuild: shouldBuild,
	build: performBuild,
};

RegisterResourceBuildTaskFactory("ds-build", () => buildOptions);