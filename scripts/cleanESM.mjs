const cleanESM = {
	name: 'remove-to-esm',
	setup(build) {
		build.onEnd(result => {
		// Ensure outputFiles exist (requires write: false)
		if (!result.outputFiles) return;

		for (const file of result.outputFiles) {
			// Process only JavaScript files (adjust the filter as needed)
			if (file.path.endsWith('.js')) {
			let code = file.text;
			// Replace the __toESM definition with an identity function.
			// This regex assumes the __toESM definition is declared as a var statement.
			// You may need to adjust this if esbuild’s output format changes.
			code = code.replace(
				/var __toESM = [\s\S]*?;/,
				'var __toESM = (mod) => mod;'
			);
			file.text = code;

			// Optionally, write the modified file to disk here:
			fs.writeFileSync(file.path, code, 'utf8');
			console.log(`Rewrote __toESM in ${file.path}`);
			}
		}
		});
	}
};