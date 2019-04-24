# Typescript preprocessor for Svelte 3

## Install

```bash
npm i svelte-ts-preprocess
```

## Rollup config

```javascript
import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";

import { preprocess } from "svelte-ts-preprocess";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/bundle.js"
  },
  plugins: [
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file — better for performance
      css: css => {
        css.write("public/bundle.css");
      },
      preprocess: preprocess()
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve(),
    commonjs(),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser()
  ]
};
```

# For Contributors

To install this monorepo you can use `lerna + npm`
```bash
cd svelte-ts-preprocess
npm i lerna -g
lerna bootstrap
```

or `lerna + yarn` see [use workspaces](https://github.com/lerna/lerna/tree/master/commands/bootstrap#--use-workspaces)
```bash
cd svelte-ts-preprocess
yarn i lerna -g
lerna bootstrap --use-workspaces
```

or `yarn only`
```bash
cd svelte-ts-preprocess
yarn install
```
