# Mjolnir documentation

The documentation of [Mjolnir](https://github.com/Aska-Modding-Community/Mjolnir), a mod loader and C# modding SDK for
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

Each push to `main` builds the site and publishes it to
[aska-modding-community.github.io/mjolnir-docs](https://aska-modding-community.github.io/mjolnir-docs/)
(`.github/workflows/deploy.yml`).

## Layout

| Path | Contents |
|---|---|
| `docs/` | The pages, in the sidebar's order of `sidebars.ts` |
| `i18n/ru/` | The Russian site: the pages under `docusaurus-plugin-content-docs/current/` at the same paths as in `docs/`, and the landing's, navbar's, footer's and sidebar's texts in JSON |
| `src/pages/index.tsx` | The landing page |
| `src/css/custom.css` | The theme: colours, fonts, the navbar and footer |
| `static/img/` | The logo |
| `docusaurus.config.ts` | Site settings, navbar, footer, code highlighting |
| `.github/workflows/deploy.yml` | Builds and publishes the site to GitHub Pages |

## Writing

- Names and signatures come from the SDK's public API and its XML documentation; a page never describes behaviour the
  code does not have.
- Every C# example must compile against an installed Mjolnir (`Mjolnir/core` and `Mjolnir/interop`).
- What is not done yet is marked as such on the page it concerns.
- A change to an English page goes into its Russian page too. Russian headings keep the English anchors
  (`## Две фазы {/* #two-phases */}`), so links work in both languages.

## License

MIT, as Mjolnir.
