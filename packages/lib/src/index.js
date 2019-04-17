const fs = require("fs"),
	ts = require("typescript"),
	colors = require("colors"),
	JSON5 = require("json5");

function printDiagnostics(diagnostics = []) {
	diagnostics.forEach(diagnostic => {
		if (diagnostic.file) {
			const {
					line,
					character
				} = diagnostic.file.getLineAndCharacterOfPosition(
					diagnostic.start
				),
				message = ts.flattenDiagnosticMessageText(
					diagnostic.messageText,
					"\n"
				);
			console.log(
				colors.yellow(
					`${diagnostic.file.fileName.replace(".ts", "")} (${line +
						1},${character + 1}): ${message}`
				)
			);
		} else {
			console.log(
				colors.yellow(
					`${ts.flattenDiagnosticMessageText(
						diagnostic.messageText,
						"\n"
					)}`
				)
			);
		}
	});
}

module.exports = function(options) {
	return {
		script: ({ content, attributes, filename }) => {
			if (attributes && !["ts", "typescript"].includes(attributes.lang))
				return;
			const configPath = ts.findConfigFile(
				process.cwd(),
				ts.sys.fileExists
			);
			if (!configPath) {
				throw new Error("Could not find a valid 'tsconfig.json'.");
			}

			return new Promise(resolve => {
				options
					? resolve(options)
					: fs.readFile(configPath, (err, content) => {
							if (err) throw err;
							resolve(JSON5.parse(content));
					  });
			}).then(options => {
				const opts = Object.assign(
					{},
					ts.getDefaultCompilerOptions(),
					options
				);
				// realHost = ts.createCompilerHost(opts, true),
				// dummyFilePath = `/${filename}.ts`,
				// dummySourceFile = ts.createSourceFile(dummyFilePath, content, ts.ScriptTarget.Latest);

				// let output;

				// const libs = opts.compilerOptions.lib || [],
				// 	host = {
				// 		fileExists: filePath => filePath === dummyFilePath || realHost.fileExists(filePath),
				// 		directoryExists: realHost.directoryExists && realHost.directoryExists.bind(realHost),
				// 		getCurrentDirectory: realHost.getCurrentDirectory.bind(realHost),
				// 		getDirectories: realHost.getDirectories.bind(realHost),
				// 		getCanonicalFileName: fileName => realHost.getCanonicalFileName(fileName),
				// 		getNewLine: realHost.getNewLine.bind(realHost),
				// 		getDefaultLibFileName: realHost.getDefaultLibFileName.bind(realHost),
				// 		getSourceFile: (fileName, languageVersion, onError, shouldCreateNewSourceFile) => fileName === dummyFilePath
				// 			? dummySourceFile
				// 			: realHost.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile),
				// 		readFile: filePath => filePath === dummyFilePath ? content : realHost.readFile(filePath),
				// 		useCaseSensitiveFileNames: () => realHost.useCaseSensitiveFileNames(),
				// 		writeFile: (fileName, data) => (output = data),
				// 	},
				// 	rootNames = libs.map(lib => require.resolve(`typescript/lib/lib.${lib}.d.ts`)),
				// 	program = ts.createProgram(rootNames.concat([dummyFilePath]), opts, host),
				// 	emitResult = program.emit(),
				// 	diagnostics = ts.getPreEmitDiagnostics(program);

				// printDiagnostics(emitResult.diagnostics.concat(diagnostics));

				const result = ts.transpileModule(content, opts);
				printDiagnostics(result.diagnostics);
				console.log("------------code----------");
				console.log(result.outputText);
				console.log("------------code----------");

				return { code: result.outputText };
			});
		}
	};
};
