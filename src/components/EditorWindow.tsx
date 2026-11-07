import type {ReactNode} from 'react';
import {Highlight, Prism, themes} from 'prism-react-renderer';
import styles from './EditorWindow.module.css';

/**
 * A code sample drawn as an editor window. The landing's dark bands are dark in either colour mode, so the sample keeps
 * one dark look too, rather than switching with the site's theme as the docs' code blocks do.
 */
export default function EditorWindow({code, title, language = 'csharp'}: {code: string; title: string; language?: string}): ReactNode {
  return (
    <figure className={styles.window}>
      <figcaption className={styles.bar}>
        <span className={styles.tab}>{title}</span>
      </figcaption>
      <Highlight theme={themes.vsDark} code={code} language={language} prism={Prism}>
        {({tokens, getLineProps, getTokenProps}) => (
          <pre className={styles.code}>
            <code>
              {tokens.map((line, i) => (
                <span key={i} {...getLineProps({line})}>
                  {line.map((token, j) => (
                    <span key={j} {...getTokenProps({token})} />
                  ))}
                  {'\n'}
                </span>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </figure>
  );
}
