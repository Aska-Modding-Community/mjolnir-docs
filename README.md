# Mjolnir documentation

The documentation of [Mjolnir](https://github.com/FibonacciFox/Mjolnir), a mod loader and C# modding SDK for
**ASKA**, and the site that presents it: a landing page and the docs, built with Docusaurus.

## Reading

The pages are plain Markdown in [`docs/`](docs/intro.md) and read on GitHub as they are. Start with the
[overview](docs/intro.md), [installing](docs/getting-started/installing.md) or
[your first mod](docs/getting-started/first-mod.md).

## Running the site

Requires Node.js 20 or later.

```bash
npm install
npm start
```

`npm start` serves the site with live reload. `npm run build` writes the static site to `build/` and fails on broken
links.

## Layout

| Path | Contents |
|---|---|
| `docs/` | The pages, in the sidebar's order of `sidebars.ts` |
| `src/pages/index.tsx` | The landing page |
| `src/css/custom.css` | The theme: colours, fonts, the navbar and footer |
| `static/img/` | The logo |
| `docusaurus.config.ts` | Site settings, navbar, footer, code highlighting |

## Writing

- Names and signatures come from the SDK's public API and its XML documentation; a page never describes behaviour the
  code does not have.
- Every C# example must compile against an installed Mjolnir (`Mjolnir/core` and `Mjolnir/interop`).
- What is not done yet is marked as such on the page it concerns.

## License

MIT, as Mjolnir.
