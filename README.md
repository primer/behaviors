# Frontend Project Template

Integrating into the monolith requires you to provide a "library style" package that can be loaded via a small amount of bootstrapping JavaScript within the github.com codebase. 

The following guidelines use [RFC 2119](https://tools.ietf.org/html/rfc2119) to indicate the levels of requirements needed.

## Main Artefact
You MUST provide a package that resides on either the GitHub Package Registry, or the npm registry. The package SHOULD be marked as private and published under the @github scope. The published package MUST adhere to the following conventions:

### package.json
The published package MUST have a package.json file. It MUST include the `name`, `version`, and `main` keys. It SHOULD include the `type` key with a value of `"module"`.

The `main` key MUST point to a valid JavaScript file within the package. This JavaScript file MUST follow the restrictions documented below.

The `package.json` file MAY contain a `style` key which MUST point to a valid CSS file within the package. This CSS file MUST follow the restrictions documented below.

The `package.json` file MAY contain an `assets` key, which MUST be an array of file names, each pointing to a valid asset within the package. These files SHOULD NOT be CSS or JS files, but MAY be images, svgs, videos, or other types of media.

Any dependencies that the JavaScript requires to operate SHOULD be declared via the `dependencies` key.

### JavaScript

JavaScript artefacts MUST follow the latest JavaScript standard, which at the time of writing is `ES2020`. The latest standard can be found here: https://tc39.es/ecma262/.

JavaScript artefacts MUST NOT use extended syntax features not specified by the EcmaScript standard, such as TypeScript syntax or JSX. EcmaScript specified features such as classes or private fields SHOULD NOT be transpiled to earlier standards, and SHOULD remain as "native" syntax.

Any dependencies required by the JavaScript SHOULD NOT be bundled into the file, and SHOULD BE declared using EcmaScript `import` statements. A JavaScript file MAY use `CommonJS` style `require()` calls but MUST NOT combine the two. A JavaScript file MUST NOT depend on any dependencies not listed in the `dependencies` key of the `package.json`.
`import` statements SHOULD use NodeJS style resolutions for "bare specifiers". They MUST use standard resolutions for "relative specifiers".

JavaScript artefacts MUST NOT evaluate code dynamically for example using `eval` or `Function('...')`. They MUST follow the CSP rules specified in response headers on github.com.

JavaScript files MUST NOT use non-standard dependencies loaders, such as webpack, AMD, or SystemJS.

JavaScript files MAY use APIs common to the latest browsers, such as `Intl` APIs, `fetch` APIs, etc. Use of these APIs SHOULD NOT be polyfilled, as they are expected to be polyfilled already. 

JavaScript files MAY be minified, but the monolith tooling will minify all JavaScript so this will be largely useless. It's recommended to not spend time setting up magnification for this reason.

### CSS

CSS artefacts MUST follow the [latest CSS standard](https://www.w3.org/Style/CSS/specs.en.html). CSS artefacts MUST NOT use alternative CSS syntax such as SCSS, LESS, SASS, etc.

There SHOULD BE only one CSS artefact, and it SHOULD NOT use `@import` statements to include other files.

CSS artefacts SHOULD BE minified. There are no additional optimization steps within the monolith so the CSS will be served as-is.

### Assets

All assets SHOULD BE optimized as there are no additional optimization steps within the monolith, so all assets are served as it. This means running optimizers such as `pngcrush` are recommended for packaged assets.

- The JavaScript can't contain any CSP violations and no javascript evals.
- The bundled JavaScript should be less than 100kb in size.
- Images needed by the application should be in `images/` in the root of the project.
- CSS should be compiled into a single file `dist/index.css` and should be less than 10kb.
