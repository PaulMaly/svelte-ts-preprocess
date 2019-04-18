const { tsquery } = require("@phenomnomnominal/tsquery");

const typescript = `
import Form from './Form.svelte';
`;

const ast = tsquery.ast(typescript);
const nodes = tsquery(
	ast,
	"ImportDeclaration:has(StringLiteral[value=/\\.svelte$/])"
);
console.log(nodes);
