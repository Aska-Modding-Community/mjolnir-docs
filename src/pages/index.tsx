import type {CSSProperties, ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate, {translate} from '@docusaurus/Translate';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import EditorWindow from '@site/src/components/EditorWindow';
import styles from './index.module.css';

const firstMod = `using Mjolnir.SDK;
using Mjolnir.SDK.Config;
using Mjolnir.SDK.Player;
using Mjolnir.SDK.UI;

[ModManifest("author.lightfoot", "Lightfoot", "1.0.0")]
public sealed class Lightfoot : Mod
{
    public override void OnLoad()
    {
        var cost = Config.Bind("Stamina", "CostMultiplier", 0.5f)
                         .WithRange(0f, 1f);

        LocalPlayer.Stamina.Draining +=
            (_, e) => e.Amount *= cost.Value;

        LocalPlayer.Spawned +=
            (_, _) => Notify.Message("Light on your feet");
    }
}`;

type IconName = 'window' | 'player' | 'chest' | 'village' | 'sun' | 'runes' | 'console' | 'anvil' | 'net' | 'motion' | 'swords' | 'globe' | 'camera' | 'terrain';

function Icon({name}: {name: IconName}): ReactNode {
  const paths: Record<IconName, ReactNode> = {
    window: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      </>
    ),
    player: (
      <>
        <circle cx="12" cy="7" r="3.5" />
        <path d="M5 21c.8-4 3.6-6.5 7-6.5s6.2 2.5 7 6.5" />
      </>
    ),
    chest: (
      <>
        <path d="M3 10h18v10H3zM3 10l2-5h14l2 5" />
        <path d="M10 13h4v3h-4z" />
      </>
    ),
    village: (
      <>
        <path d="M2 21h20M4 21V11l5-5 5 5v10" />
        <path d="M14 21v-7l4-4 4 4v7M8 21v-4h2v4" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
      </>
    ),
    runes: (
      <>
        <path d="M6 3v18M6 8l5-4M6 13l5 4" />
        <path d="M15 3v18M15 3l4 5-4 5" />
      </>
    ),
    console: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="1" />
        <path d="m6 9 3 3-3 3M12 15h5" />
      </>
    ),
    anvil: (
      <>
        <path d="M3 7h14c0 3-2 5-5 5H9l-1 3h8v4H6v-4l1-3C4.8 12 3 10 3 7z" />
        <path d="M17 7h4" />
      </>
    ),
    motion: (
      <>
        <circle cx="13" cy="4" r="2" />
        <path d="M11 8 8 13l4 2-1 6M11 8l4 3 4-1M8 13H4" />
      </>
    ),
    swords: (
      <>
        <path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" />
        <path d="M14.5 6.5 18 3h3v3l-3.5 3.5M5 14l4 4M7 17l-3 3M3 19l2 2" />
      </>
    ),
    camera: (
      <>
        <path d="M3 8h4l2-3h6l2 3h4v11H3z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),
    terrain: (
      <>
        <path d="M2 17.5 8 9.5l4 5 3-3.5 7 6.5z" />
        <path d="M2 21h20" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" />
      </>
    ),
    net: (
      <>
        <circle cx="5" cy="12" r="2.5" />
        <circle cx="19" cy="5" r="2.5" />
        <circle cx="19" cy="19" r="2.5" />
        <path d="M7.3 11 16.7 6.1M7.3 13l9.4 4.9" />
      </>
    ),
  };
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function Diamond(): ReactNode {
  return <span className={styles.diamond} aria-hidden="true" />;
}

/** A landing text by id, English as written here, other languages from i18n/<locale>/code.json. */
function t(id: string, message: string): string {
  return translate({id: `landing.${id}`, message});
}

function Hero(): ReactNode {
  // The art's hammer is the hero's emblem: the title stands over the sky, the call to action over the moss, and the
  // hammer between them stays in view.
  const art = useBaseUrl('/img/hero.webp');
  return (
    <header className={styles.hero} style={{'--mj-hero-art': `url(${art})`} as CSSProperties}>
      <div className={styles.heroInner}>
        <div className={styles.heroTop}>
          <p className={styles.kicker}>{t('hero.kicker', 'Mod loader and C# SDK for ASKA')}</p>
          <Heading as="h1" className={styles.title}>Mjolnir</Heading>
        </div>
        <div className={styles.plate}>
          <p className={styles.lead}>
            {t('hero.lead', 'Write ASKA mods in C# on .NET 10: events, bindable state and builders for UI, players, content and villagers.')}
          </p>
          <span className={styles.plateLabel}>{t('hero.plate', '0.x · Single player and hosted worlds')}</span>
          <div className={styles.actions}>
            <Link className={styles.primary} to="/docs/getting-started/first-mod">{t('hero.write', 'Get started')}</Link>
            <Link className={styles.secondary} to="/docs/getting-started/installing">{t('hero.install', 'Install')}</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Paths(): ReactNode {
  const paths = [
    {to: '/docs/getting-started/installing', title: t('paths.play', 'Install'), text: t('paths.play.text', 'Unpack into the game folder and launch from Steam.')},
    {to: '/docs/getting-started/first-mod', title: t('paths.forge', 'First mod'), text: t('paths.forge.text', 'A class library, one class, built against your install.')},
    {to: '/docs/architecture', title: t('paths.inside', 'Architecture'), text: t('paths.inside.text', 'Boot chain, interop generation, fault isolation.')},
  ];
  return (
    <section className={styles.band} aria-label={t('paths.label', 'Where to start')}>
      <div className={styles.paths}>
        {paths.map((p) => (
          <Link key={p.to} className={styles.path} to={p.to}>
            <span className={styles.pathTitle}>{p.title}</span>
            <span className={styles.pathText}>{p.text}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CodeSection(): ReactNode {
  return (
    <section className={styles.section}>
      <div className={styles.split}>
        <div className={styles.splitText}>
          <Heading as="h2" className={styles.h2}>{t('code.title', 'A complete mod')}</Heading>
          <p>
            {t('code.text', 'A manifest, a setting and two handlers. The setting shows up in the in-game Mods window and persists to TOML. An exception disables this mod only.')}
          </p>
          <ul className={styles.checks}>
            <li>
              <Translate id="landing.code.events" values={{cancel: <code>Cancel</code>}}>
                {'Pre-events with {cancel} and mutable arguments'}
              </Translate>
            </li>
            <li>{t('code.bindables', 'Bindable stats, settings and localized text')}</li>
            <li>{t('code.ids', 'Deterministic content IDs, identical on every machine')}</li>
          </ul>
          <Link className={styles.textLink} to="/docs/concepts/lifecycle">{t('code.more', 'Mod lifecycle →')}</Link>
        </div>
        <div className={styles.splitCode}>
          <EditorWindow title="Lightfoot.cs" code={firstMod} />
        </div>
      </div>
    </section>
  );
}

function Modules(): ReactNode {
  const modules: {icon: IconName; name: string; to: string; text: string}[] = [
    {icon: 'window', name: t('modules.ui', 'UI'), to: '/docs/guides/ui/overview', text: t('modules.ui.text', 'Windows, HUD, menus and tabs in the game\u2019s own windows, built from its UI.')},
    {icon: 'player', name: t('modules.player', 'Player'), to: '/docs/guides/player', text: t('modules.player.text', 'Spawn and death events, vitals, stamina costs, teleport.')},
    {icon: 'chest', name: t('modules.content', 'Content'), to: '/docs/guides/content/items-and-recipes', text: t('modules.content.text', 'Items, weapons, armour and food, recipes, buildings built in stages, effects, models.')},
    {icon: 'runes', name: t('modules.characters', 'Characters'), to: '/docs/guides/characters', text: t('modules.characters.text', 'Attributes, modifiers, skills, experience, status effects.')},
    {icon: 'swords', name: t('modules.combat', 'Combat'), to: '/docs/guides/combat', text: t('modules.combat.text', 'Health, blows and deaths of the player, villagers and creatures; damage changed or cancelled.')},
    {icon: 'village', name: t('modules.residents', 'Villagers'), to: '/docs/guides/residents', text: t('modules.residents.text', 'Villagers, jobs by priority, interactions at buildings.')},
    {icon: 'motion', name: t('modules.anim', 'Animations'), to: '/docs/guides/animations', text: t('modules.anim.text', 'The game’s clips and your own on the player and villagers, emotes, bones.')},
    {icon: 'sun', name: t('modules.world', 'World'), to: '/docs/guides/world', text: t('modules.world.text', 'World clock: hour, day and night, time stop.')},
    {icon: 'terrain', name: t('modules.terrain', 'Terrain'), to: '/docs/guides/terrain', text: t('modules.terrain.text', 'Heights, kinds and biomes of the ground, changes with snapshots and outlines, the world’s trees and stones.')},
    {icon: 'camera', name: t('modules.camera', 'Camera'), to: '/docs/guides/camera', text: t('modules.camera.text', 'Reading the view, modifiers that add up, cameras of a mod\u2019s own with blends.')},
    {icon: 'net', name: t('modules.net', 'Multiplayer'), to: '/docs/guides/network', text: t('modules.net.text', 'Mod check on join, message channels between players’ mods.')},
    {icon: 'anvil', name: t('modules.kit', 'Mod kit'), to: '/docs/guides/mod-kit', text: t('modules.kit.text', 'Unity project for models, animations and masks on the game\u2019s own skeletons.')},
  ];
  return (
    <section className={styles.parchment}>
      <div className={styles.container}>
        <Heading as="h2" className={styles.h2Center}>{t('modules.title', 'SDK modules')}</Heading>
        <div className={styles.rule}><Diamond /><span /><Diamond /></div>
        <div className={styles.grid}>
          {modules.map((m) => (
            <Link key={m.to} className={styles.card} to={m.to}>
              <span className={styles.cardIcon}><Icon name={m.icon} /></span>
              <span className={styles.cardName}>{m.name}</span>
              <span className={styles.cardText}>{m.text}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Boot(): ReactNode {
  const steps = [
    {name: 'version.dll', text: t('boot.proxy', 'A version.dll proxy hooks il2cpp_init by name. No hardcoded addresses.')},
    {name: 'CoreCLR', text: t('boot.clr', 'A private .NET 10 runtime starts inside the game process.')},
    {name: 'Core', text: t('boot.core', 'Generates interop for the game build, starts HarmonyX, loads mods in dependency order.')},
    {name: 'SDK', text: t('boot.sdk', 'A stable API over the game\u2019s types. Game renames are absorbed here, not in mods.')},
  ];
  return (
    <section className={`${styles.section} ${styles.sectionRunes}`}>
      <div className={styles.container}>
        <Heading as="h2" className={styles.h2Center}>{t('boot.title', 'Boot chain')}</Heading>
        <div className={styles.rule}><Diamond /><span /><Diamond /></div>
        <p className={styles.center}>
          {t('boot.lead', 'Its own injection, its own runtime and its own API: four layers between the game’s native code and a mod.')}
        </p>
        <ol className={styles.steps}>
          {steps.map((s, i) => (
            <li key={s.name} className={styles.step}>
              <span className={styles.stepNumber}><span className={styles.stepNumeral}>{['I', 'II', 'III', 'IV'][i]}</span></span>
              <span className={styles.stepName}>{s.name}</span>
              <span className={styles.stepText}>{s.text}</span>
            </li>
          ))}
        </ol>
        <p className={styles.center}>
          <Link className={styles.textLink} to="/docs/architecture">{t('boot.more', 'Architecture →')}</Link>
        </p>
      </div>
    </section>
  );
}

function Compare(): ReactNode {
  return (
    <section className={styles.section}>
      <div className={styles.containerNarrow}>
        <Heading as="h2" className={styles.h2Center}>{t('compare.title', 'Coming from BepInEx')}</Heading>
        <div className={styles.rule}><Diamond /><span /><Diamond /></div>
        <p className={styles.center}>
          {t('compare.lead', 'Every ASKA mod published today is a BepInEx 6 IL2CPP plugin. The same C#, the same Harmony, a different platform under them.')}
        </p>
        <div className={styles.status}>
          <div>
            <span className={styles.statusTitle}>{t('compare.gain', 'What Mjolnir adds')}</span>
            <ul>
              <li>{t('compare.gain.1', 'Its own proxy and a private .NET 10 runtime, with interop generated for your game build')}</li>
              <li>{t('compare.gain.2', 'Fault isolation: a failing mod is disabled alone, the game and the other mods carry on')}</li>
              <li>{t('compare.gain.3', 'An SDK per area of the game, where renames are absorbed instead of breaking mods')}</li>
              <li>{t('compare.gain.4', 'Mods declared, ordered and checked between host and client on join')}</li>
            </ul>
          </div>
          <div>
            <span className={styles.statusTitle}>{t('compare.keep', 'What a plugin keeps')}</span>
            <ul>
              <li>{t('compare.keep.1', 'The same HarmonyX attributes, prefixes and postfixes')}</li>
              <li>{t('compare.keep.2', 'Config.Bind with the same shape, and the mod id it already has')}</li>
              <li>{t('compare.keep.3', 'Raw Harmony wherever the SDK has no facade yet')}</li>
              <li>{t('compare.keep.4', 'Most of the rest is deleted: the SDK already has it')}</li>
            </ul>
          </div>
        </div>
        <p className={styles.center}>
          <Link className={styles.textLink} to="/docs/getting-started/from-bepinex">{t('compare.more', 'Porting a plugin →')}</Link>
        </p>
      </div>
    </section>
  );
}

function Players(): ReactNode {
  const code = (text: string) => <code>{text}</code>;
  return (
    <section className={styles.parchment}>
      <div className={styles.container}>
        <Heading as="h2" className={styles.h2Center}>{t('players.title', 'Install')}</Heading>
        <div className={styles.rule}><Diamond /><span /><Diamond /></div>
        <ol className={styles.install}>
          <li>
            <Translate id="landing.players.unpack" values={{verb: <b>{t('players.unpack.verb', 'Unpack')}</b>, exe: code('Aska.exe')}}>
              {'{verb} the release archive into the folder with {exe}.'}
            </Translate>
          </li>
          <li>
            <Translate id="landing.players.start" values={{verb: <b>{t('players.start.verb', 'Launch')}</b>}}>
              {'{verb} the game from Steam. The first launch generates interop for your game build, about 30 s.'}
            </Translate>
          </li>
          <li>
            <Translate id="landing.players.mods" values={{verb: <b>{t('players.mods.verb', 'Add mods')}</b>, folder: code('Mjolnir/Mods')}}>
              {'{verb} to {folder}, one folder per mod. Turn them on and off in the in-game Mjolnir menu.'}
            </Translate>
          </li>
        </ol>
        <p className={styles.center}>
          <Translate id="landing.players.uninstall" values={{dll: code('version.dll'), flag: code('--no-mods')}}>
            {'To uninstall, delete {dll}. To launch once without mods, pass {flag}.'}
          </Translate>
        </p>
      </div>
    </section>
  );
}

function Status(): ReactNode {
  return (
    <section className={styles.section}>
      <div className={styles.containerNarrow}>
        <Heading as="h2" className={styles.h2Center}>{t('status.title', 'Status')}</Heading>
        <div className={styles.rule}><Diamond /><span /><Diamond /></div>
        <div className={styles.status}>
          <div>
            <span className={styles.statusTitle}>{t('status.works', 'Available')}</span>
            <ul>
              <li>{t('status.works.1', 'Single player, hosting, joining a host with the same mods')}</li>
              <li>{t('status.works.2', 'UI, player, items, weapons and armour, buildings, characters, combat, villagers, interactions, animations, world clock, terrain, camera, multiplayer, console')}</li>
              <li>{t('status.works.3', 'Interop generated locally and regenerated after game updates')}</li>
            </ul>
          </div>
          <div>
            <span className={styles.statusTitle}>{t('status.todo', 'Planned')}</span>
            <ul>
              <li>{t('status.todo.1', 'Villager jobs, stat modifiers and terrain changes checked on joined clients')}</li>
              <li>{t('status.todo.2', 'Worn models for armour, buildings with a function of their own')}</li>
              <li>{t('status.todo.3', 'Felling trees with their loot, plants and stones of a mod’s own')}</li>
            </ul>
          </div>
        </div>
        <p className={styles.center}>
          {t('status.api', 'The public API may change between 0.x releases. Every change is recorded in the API baseline.')}
        </p>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title={t('meta.title', 'Mod loader and C# SDK for ASKA')}
      description={t('meta.description', 'Mjolnir is a mod loader and C# SDK for ASKA.')}>
      <Hero />
      <Paths />
      <main>
        <CodeSection />
        <Modules />
        <Boot />
        <Compare />
        <Players />
        <Status />
      </main>
    </Layout>
  );
}
