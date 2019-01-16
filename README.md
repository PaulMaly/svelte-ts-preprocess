# svelte-transitions-morph ([demo](https://v3.svelte.technology/repl?version=3.0.0-alpha17&gist=b1ec0d308e5c78d98af8cfb1842b8aa8))

Morphing transition plugin for [Svelte 3](https://v3.svelte.technology).

## Usage

Install with npm or yarn:

```bash
npm install --save svelte-transitions-morph
```

Then import the plugin to your Svelte component.

```html
<label>
	<input bind:checked={visible} type=checkbox> show
</label>
 
{#if visible}
<div transition:morph class="block"></div>
{/if}
 
<script>
  import morph from 'svelte-transitions-morph';

  let visible = false;
</script> 
 
<style>
  .block { background: red; color: white; width: 300px; height: 100px; }
</style>
```
[demo](https://v3.svelte.technology/repl?version=3.0.0-alpha17&gist=b1ec0d308e5c78d98af8cfb1842b8aa8)

## Parameters

As with most transitions, you can specify `delay` and `duration` parameters (both in milliseconds) and a custom `easing` function. Also, you can specify `from` parameter which is initial rectangle from which exactly transition should start.

```html
<label>
	<input bind:checked={visible} type=checkbox> show
</label>
 
{#if visible}
<div 
  transition:morph={{ 
    delay: 100, 
    duration: 1000, 
    easing: quintOut, 
    from: { left: 10, top: 20, width: 100, height: 50 }
  }} class="block"
></div>
{/if}
 
<script>
  import morph from 'svelte-transitions-morph';
  import { quintOut } from 'svelte/easing';
 
  let visible = false;
</script> 
 
<style>
  .block { background: red; color: white; width: 300px; height: 100px; }
</style>
```
[demo](https://v3.svelte.technology/repl?version=3.0.0-alpha17&gist=cc05a2f0a6dd3a354011a28a4554e3b5)

## License

MIT