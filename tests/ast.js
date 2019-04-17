const escodegen = require("escodegen");
const parser = require("@typescript-eslint/typescript-estree");
const code = `
import Form from './Form.svelte';

const hello: string = 'world';

/*
interface Person {
 name: string;
 age: number;
 phone?: string;
}
*/

const p = {
  name: 'Alice',
  age: 18,
}
`;
const ast = parser.parse(code, {
	range: true,
	loc: true
});

const result = escodegen.generate(ast);
console.log(result);
