const ts = require("typescript");

const source = `
import Form from  './Form.svelte';
Form;
import y from './module.ts';

let x: string = y;
let z: string = '';
`;

let result = ts.transpileModule(source, {
	reportDiagnostics: true,
	compilerOptions: {
		target: "es6",
		module: "es6"
	}
});

console.log(result);
