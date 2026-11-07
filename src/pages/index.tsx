import type {ReactNode} from 'react';
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

type IconName = 'window' | 'player' | 'chest' | 'village' | 'sun' | 'runes' | 'console' | 'anvil';

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
  const emblem = useBaseUrl('/img/logo.svg');
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <img className={styles.emblem} src={emblem} alt="" width="120" height="120" />
        <p className={styles.kicker}>{t('hero.kicker', 'A mod loader and C# SDK for ASKA')}</p>
        <Heading as="h1" className={styles.title}>Mjolnir</Heading>
        <p className={styles.lead}>
          {t('hero.lead', 'Mods are .NET 10 assemblies that run inside the game. They speak to it through plain C# events, bindable values and builders, and can still reach for HarmonyX when they need to.')}
        </p>
        <div className={styles.plate}>
          <span className={styles.plateLabel}>{t('hero.plate', 'Version 0.x · single player and hosting')}</span>
          <div className={styles.actions}>
            <Link className={styles.primary} to="/docs/getting-started/first-mod">{t('hero.write', 'Write a mod')}</Link>
            <Link className={styles.secondary} to="/docs/getting-started/installing">{t('hero.install', 'Install')}</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Paths(): ReactNode {
  const paths = [
    {to: '/docs/getting-started/installing', title: t('paths.play', 'Play with mods'), text: t('paths.play.text', 'Unpack, start from Steam, drop mods in a folder.')},
    {to: '/docs/getting-started/first-mod', title: t('paths.forge', 'Forge a mod'), text: t('paths.forge.text', 'A class library, one class, a few lines.')},
    {to: '/docs/architecture', title: t('paths.inside', 'See inside'), text: t('paths.inside.text', 'How the loader reaches the game, and keeps it safe.')},
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
          <Heading as="h2" className={styles.h2}>{t('code.title', 'A whole mod on one screen')}</Heading>
          <p>
            {t('code.text', 'A mod is a class with a manifest. Its settings appear in the game’s own Mods window, saved to a TOML file. Its handlers run on the game’s main thread, and an exception in one of them turns off that mod alone.')}
          </p>
          <ul className={styles.checks}>
            <li>
              <Translate id="landing.code.events" values={{cancel: <code>Cancel</code>}}>
                {'Events before things happen, with {cancel} and values to change'}
              </Translate>
            </li>
            <li>{t('code.bindables', 'Bindable stats, configs and texts that UI follows by itself')}</li>
            <li>{t('code.ids', 'Content ids from the mod’s id and a name, the same on every machine')}</li>
          </ul>
          <Link className={styles.textLink} to="/docs/concepts/lifecycle">{t('code.more', 'How a mod lives →')}</Link>
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
    {icon: 'window', name: t('modules.ui', 'UI'), to: '/docs/guides/ui/overview', text: t('modules.ui.text', 'Windows, HUD, menus, tabs in the game’s own windows, made from the game’s interface.')},
    {icon: 'player', name: t('modules.player', 'Player'), to: '/docs/guides/player', text: t('modules.player.text', 'Spawns and deaths, health, stamina, food, water, warmth, teleports.')},
    {icon: 'chest', name: t('modules.content', 'Content'), to: '/docs/guides/content/items-and-recipes', text: t('modules.content.text', 'Items, recipes by hand and at the workshop, buildings, effects, models.')},
    {icon: 'runes', name: t('modules.characters', 'Characters'), to: '/docs/guides/characters', text: t('modules.characters.text', 'Attributes, modifiers, skills, experience and status effects of anyone.')},
    {icon: 'village', name: t('modules.residents', 'Residents'), to: '/docs/guides/residents', text: t('modules.residents.text', 'The settlement’s villagers, and jobs of your own they take by priority.')},
    {icon: 'sun', name: t('modules.world', 'World'), to: '/docs/guides/world', text: t('modules.world.text', 'The world’s clock: the hour, day and night, time stopped.')},
    {icon: 'console', name: t('modules.console', 'Console'), to: '/docs/guides/console', text: t('modules.console.text', 'Commands of your own beside give, tp, time and stats.')},
    {icon: 'anvil', name: t('modules.kit', 'Mod kit'), to: '/docs/guides/content/models', text: t('modules.kit.text', 'A Unity project set up for the game’s version and pipeline.')},
  ];
  return (
    <section className={styles.parchment}>
      <div className={styles.container}>
        <Heading as="h2" className={styles.h2Center}>{t('modules.title', 'What a mod can reach')}</Heading>
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
    {name: 'version.dll', text: t('boot.proxy', 'The game loads Mjolnir’s proxy of a system library, which waits for the game’s runtime by name.')},
    {name: 'CoreCLR', text: t('boot.clr', 'Once the game’s runtime is up, a private .NET 10 starts in the same process.')},
    {name: 'Core', text: t('boot.core', 'Generates the game’s interop for this build, starts Harmony, loads mods in dependency order.')},
    {name: 'SDK', text: t('boot.sdk', 'Gives mods events, bindables and builders. A rename in the game is fixed here, not in every mod.')},
  ];
  return (
    <section className={`${styles.section} ${styles.sectionRunes}`}>
      <div className={styles.container}>
        <Heading as="h2" className={styles.h2Center}>{t('boot.title', 'From the first library to your mod')}</Heading>
        <div className={styles.rule}><Diamond /><span /><Diamond /></div>
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
          <Link className={styles.textLink} to="/docs/architecture">{t('boot.more', 'The architecture in full →')}</Link>
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
        <Heading as="h2" className={styles.h2Center}>{t('players.title', 'For players')}</Heading>
        <div className={styles.rule}><Diamond /><span /><Diamond /></div>
        <ol className={styles.install}>
          <li>
            <Translate id="landing.players.unpack" values={{verb: <b>{t('players.unpack.verb', 'Unpack')}</b>, exe: code('Aska.exe')}}>
              {'{verb} the release archive into the game’s folder, the one with {exe}.'}
            </Translate>
          </li>
          <li>
            <Translate id="landing.players.start" values={{verb: <b>{t('players.start.verb', 'Start')}</b>}}>
              {'{verb} the game from Steam. The first start prepares Mjolnir for the game’s build, about half a minute.'}
            </Translate>
          </li>
          <li>
            <Translate id="landing.players.mods" values={{verb: <b>{t('players.mods.verb', 'Add mods')}</b>, folder: code('Mjolnir/Mods')}}>
              {'{verb} to {folder}, a folder each, and turn them on or off in the game’s menu.'}
            </Translate>
          </li>
        </ol>
        <p className={styles.center}>
          <Translate id="landing.players.uninstall" values={{dll: code('version.dll'), flag: code('--no-mods')}}>
            {'Uninstalling is deleting {dll}. Starting once without mods is {flag}.'}
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
        <Heading as="h2" className={styles.h2Center}>{t('status.title', 'Where it stands')}</Heading>
        <div className={styles.rule}><Diamond /><span /><Diamond /></div>
        <div className={styles.status}>
          <div>
            <span className={styles.statusTitle}>{t('status.works', 'Works')}</span>
            <ul>
              <li>{t('status.works.1', 'Single player and hosting a world')}</li>
              <li>{t('status.works.2', 'UI, player, content, characters, residents, the clock, the console')}</li>
              <li>{t('status.works.3', 'Interop generated on the player’s machine, again after each game update')}</li>
            </ul>
          </div>
          <div>
            <span className={styles.statusTitle}>{t('status.todo', 'Not done yet')}</span>
            <ul>
              <li>{t('status.todo.1', 'Clients joining a host with mods')}</li>
              <li>{t('status.todo.2', 'The mod-compatibility handshake')}</li>
              <li>{t('status.todo.3', 'Building models of a mod’s own')}</li>
            </ul>
          </div>
        </div>
        <p className={styles.center}>
          {t('status.api', 'The public API can change between 0.x versions; every change is declared in the repository.')}
        </p>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title={t('meta.title', 'Mod loader and C# SDK for ASKA')}
      description={t('meta.description', 'Mjolnir is a mod loader and C# modding SDK for the game ASKA.')}>
      <Hero />
      <Paths />
      <main>
        <CodeSection />
        <Modules />
        <Boot />
        <Players />
        <Status />
      </main>
    </Layout>
  );
}
