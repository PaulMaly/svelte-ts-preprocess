***!!! THIS PREPROCESSOR IS VERY EXPERIMENTAL !!!***

# svelte-ts-preprocess

Typescript type-checking preprocessor for [Svelte 3](https://v3.svelte.technology).

## Usage

Install with npm or yarn:

```bash
npm install --save-dev svelte-ts-preprocess
```

Then import the plugin to your bundler config. Rollup example below.

```javascript
import svelte from 'rollup-plugin-svelte';
import ts from 'svelte-ts-preprocess';
...
export default {
	...
	plugins: [
		svelte({
			...
			preprocess: [
				ts()
			]
		}),
		...
	]
};
```

Or use it with [svelte-preprocess](https://www.npmjs.com/package/svelte-preprocess):

```javascript
import svelte from 'rollup-plugin-svelte';
import ts from 'svelte-ts-preprocess';
import preprocess from 'svelte-preprocess';
...
export default {
	...
	plugins: [
		svelte({
			...
			preprocess: preprocess({
				transformers: {
					ts: ts().script
				},
				aliases: [
					['ts', 'typescript']
				]
			})
		}),
		...
	]
};
```

## Options

By default Typescript options will be retrieved from *tsconfig.json* but you also can pass config object directly to the preprocessor function. You should choose one of this variants to get it work.

## Example

After preprocessor is setted up you'll be able to write Typescript code inside of component's script.

```html
<script lang="ts">
	interface HTMLInputTarget {
    	"target": HTMLInputElement;
	}

	export let num: number = 0;

	function handleChange(e: HTMLInputTarget) {
		num = e.target.value;
	}
</script>

<input on:change={handleChange} placeholper="Enter a number">
```

And will get type-checking warnings upon building process.

```bash
./src/App.svelte (9,2): Type 'string' is not assignable to type 'number'.
```

## License

MIT