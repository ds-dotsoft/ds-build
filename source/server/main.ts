/**
 * ds-boilerplate
 * server/main.ts
 */

import chalk from "chalk";
import esbuild from "esbuild";
import { createRequire } from "module";

import path from "path";
import url from "url";

console.log(chalk.blue("✅ Build script loaded."));

function performBuild(resource: string, cb: (success: boolean, status: string) => void) {
	const numMetaData = GetNumResourceMetadata(resource, "esbuild_config");
	let error = false;

	for (let i = 0; i < numMetaData; i++) {
		const configName = GetResourceMetadata(resource, "esbuild_config", i);
		console.log(chalk.yellow(`❗Found resource "${resource}" requesting bundling.`));
		console.log(chalk.yellow(`❗Config name: ${configName}`));

		// TODO: in future, perform checksum calculation on file, and compare with previous checksum.
		// TODO: if the checksum is the same, do not build again
		// Compute the absolute path
		const configAbsPath = path.join(GetResourcePath(resource), configName);
		// Also compute a relative path to the CWD for logging
		const configRelPath = path.relative(process.cwd(), configAbsPath);
		console.log(chalk.yellow(`[ ! ] Computed config path: ${configRelPath}`));

		import(configPath)
			.then((script) => {
				console.log(chalk.yellow("[ ! ] Contents of config: " + script));

				if (!script || !Object.keys(script).length) {
					console.error(chalk.red("❌  Failed to load build script, continuing..."));
					console.error(chalk.red("Contents of the build script: " + script));
					return; // Config file could not be imported, go to next iteration.
				}
		
				const buildScripts = Object.keys(script).length > 1 ? [...script] : [script];
		
				for (const script of buildScripts) {
					console.log(chalk.yellow(`❗${resource} Building...`));
		
					const result = esbuild.buildSync(script);
			
					if (!result.errors.length) {
						console.log(chalk.green(`✅ [${resource} - ${script.entryPoints}] Build successful!`))
					} else {
						console.error(chalk.red(`❌  [${resource} - ${script.entryPoints}] Build unsuccessful.\nError: ${result.errors.toString()}`));
						error = true;
					}
				}
			})
			.catch((e) => { console.error(chalk.red("❌  Failed to load requested compute script.")); cb(false, "Build unsuccessful") });
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