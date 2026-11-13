import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: ['getting-started/installing', 'getting-started/first-mod', 'getting-started/from-bepinex'],
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      items: [
        'concepts/lifecycle',
        'concepts/config',
        'concepts/localization',
        'concepts/bindables-and-events',
        'concepts/threading',
        'concepts/harmony',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'User interface',
          items: ['guides/ui/overview', 'guides/ui/controls', 'guides/ui/binding', 'guides/ui/hud-and-menus'],
        },
        'guides/player',
        {
          type: 'category',
          label: 'Content',
          items: [
            'guides/content/items-and-recipes',
            'guides/content/equipment',
            'guides/content/buildings',
            'guides/content/effects',
            'guides/content/models',
            'guides/content/catalog',
          ],
        },
        'guides/characters',
        'guides/combat',
        'guides/residents',
        'guides/interactions',
        'guides/animations',
        'guides/mod-kit',
        'guides/world',
        'guides/terrain',
        'guides/camera',
        'guides/network',
        'guides/console',
      ],
    },
    'architecture',
    'troubleshooting',
    {
      type: 'category',
      label: 'Contributing',
      items: ['contributing/building'],
    },
  ],
};

export default sidebars;
