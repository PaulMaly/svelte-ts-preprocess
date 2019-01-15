# svelte-transitions-morph ([demo]())

Morphing transition plugin for [Svelte 3](https://v3.svelte.technology).

## Usage

Install with npm or yarn:

```bash
npm install --save svelte-transitions-morph
```

Then import the plugin to your Svelte component.

```html
<input bind:checked={visible} type=checkbox> show
</label>

{#if visible}
  <div transition:morph class="morphing">
    <h1>Hello Morph</h1>
  </div>
{/if}

<script>
  import morph from 'svelte-transitions-morph';

  let visible = false;
</script>

<style>
  .morphing { background: red; color: white; }
</style>
```

## Parameters

As with most transitions, you can specify `delay` and `duration` parameters (both in milliseconds) and a custom `easing` function. Also, you can specify `from` parameter which is initial rectangle (by default { left: 0, top: 0, width: 0, height: 0 }) from which transition should start.

```html
{#if visible}
<div transition:morph={{ delay: 250, duration: 1000, easing: quintOut, from: { left: 10, top: 20 }}}>
    <h1>Hello Morph</h1>
</div>
{/if}

<script>
  import morph from 'svelte-transitions-morph';
  import { quintOut } from 'svelte/easing';

  let visible = false;
</script>
```


## License

[MIT]()