import { Fragment } from 'react';

// Text helpers for the reveal animations (see revealWithin in lib/motion.js).

/** Heading whose lines rise out of a mask. `lines` is an array of strings or JSX. */
export function MaskLines({ as: Tag = 'h2', lines, className = '', id }) {
  return (
    <Tag className={`mask-lines ${className}`} data-mask="" id={id}>
      {lines.map((l, i) => (
        <span className="ml" key={i}>
          <span className="ml-i">{l}</span>
        </span>
      ))}
    </Tag>
  );
}

/** Paragraph revealed word by word. Screen readers get the plain text. */
export function Words({ as: Tag = 'p', text, className = '' }) {
  const words = text.split(' ');
  return (
    <Tag className={className} data-lines="">
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="wm" aria-hidden="true">
            <span className="w">{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Every character in its own span (hero headline). */
export function Chars({ text }) {
  return (
    <span aria-hidden="true">
      {[...text].map((c, i) => (
        <span className="ch" key={i}>
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  );
}

export function Wordmark({ className = '' }) {
  return (
    <span className={`wordmark ${className}`} translate="no">
      <span className="wm-hue">HUE</span>
      <span className="wm-line">line</span>
    </span>
  );
}
