import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const repository = 'https://github.com/FibonacciFox/Mjolnir';
const docsRepository = 'https://github.com/Aska-Modding-Community/mjolnir-docs';

const config: Config = {
  title: 'Mjolnir',
  tagline: 'A mod loader and C# modding SDK for ASKA',
  favicon: 'img/logo.svg',

  future: {
    v4: true,
  },

  url: 'https://aska-modding-community.github.io',
  baseUrl: '/mjolnir-docs/',
  organizationName: 'Aska-Modding-Community',
  projectName: 'mjolnir-docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    localeConfigs: {
      en: {label: 'English', htmlLang: 'en'},
      ru: {label: 'Русский', htmlLang: 'ru'},
    },
  },

  headTags: [
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'}},
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'}},
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Germania+One&family=Oswald:wght@600&family=PT+Sans:ital,wght@0,400;0,700;1,400&family=Lato:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap',
      },
    },
  ],

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          // The pages are plain Markdown in docs/, readable on GitHub as well.
          path: 'docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: `${docsRepository}/edit/main/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.svg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Mjolnir',
      logo: {
        alt: 'Mjolnir',
        src: 'img/logo.svg',
      },
      items: [
        {type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs'},
        {to: '/docs/getting-started/first-mod', label: 'First mod', position: 'left'},
        {to: '/docs/guides/ui/overview', label: 'Guides', position: 'left'},
        {type: 'localeDropdown', position: 'right'},
        {href: `${repository}/releases`, label: 'Download', position: 'right'},
        {href: repository, label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Play with mods',
          items: [
            {label: 'Installing', to: '/docs/getting-started/installing'},
            {label: 'Troubleshooting', to: '/docs/troubleshooting'},
          ],
        },
        {
          title: 'Make mods',
          items: [
            {label: 'Your first mod', to: '/docs/getting-started/first-mod'},
            {label: 'Mod lifecycle', to: '/docs/concepts/lifecycle'},
            {label: 'Examples', href: `${repository}/tree/main/examples`},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'Architecture', to: '/docs/architecture'},
            {label: 'Building from source', to: '/docs/contributing/building'},
            {label: 'GitHub', href: repository},
          ],
        },
      ],
      copyright: `Mjolnir is MIT-licensed. ASKA is a game by Sand Sailor Studio; Mjolnir is not affiliated with it.`,
    },
    mermaid: {
      // Colours come from the diagrams' own classes and custom.css, so one look serves both colour modes.
      theme: {light: 'base', dark: 'base'},
      options: {
        fontFamily: 'Lato, PT Sans, system-ui, sans-serif',
        flowchart: {curve: 'basis', nodeSpacing: 22, rankSpacing: 40, padding: 12, diagramPadding: 4},
      },
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['csharp', 'toml', 'powershell', 'bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
