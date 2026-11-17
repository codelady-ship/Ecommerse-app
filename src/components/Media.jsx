import { useEffect, useRef, useState } from 'react';
import { POSTERS, src, videoSrc } from '../data/catalog.js';

/**
 * Photo with the spec's fallback chain: the named photo, then `fallback` (usually the product's own
 * photo), then a block filled with the dye colour.
 */
export function Img({ name, fallback, alt, color = '#16141a', pos = '50% 40%', zoom = 1, className = '', eager = false, sizes }) {
  const first = src(name) || src(fallback);
  const [url, setUrl] = useState(first);
  useEffect(() => setUrl(src(name) || src(fallback)), [name, fallback]);
  const style = { objectPosition: pos, ...(zoom !== 1 ? { transform: `scale(${zoom})`, transformOrigin: pos } : null) };
  if (!url) {
    return <div className={`dye-block ${className}`} style={{ background: color }} role="img" aria-label={alt} />;
  }
  return (
    <img
      className={className}
      src={url}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      sizes={sizes}
      style={style}
      draggable="false"
      onError={() => setUrl((u) => (u !== src(fallback) && src(fallback) ? src(fallback) : null))}
    />
  );
}

/**
 * Film slot: plays <name>.webm / .mp4 when the files exist (LOCAL.hasVideo), otherwise shows the poster
 * photo. The poster still is removed once the video fires 'playing'. `active=false` pauses it.
 */
export function Film({ name, alt, className = '', active = true, eager = false, color }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const webm = videoSrc(name, 'webm');
  const mp4 = videoSrc(name, 'mp4');
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && !reduced) v.play().catch(() => {});
    else v.pause();
  }, [active, reduced]);

  if (!webm && !mp4) {
    return <Img name={POSTERS[name]} alt={alt} className={className} eager={eager} color={color} pos="50% 35%" />;
  }
  return (
    <div className={`film ${className}`}>
      <video
        ref={ref}
        muted
        loop
        playsInline
        autoPlay={!reduced}
        preload="metadata"
        poster={src(POSTERS[name]) || undefined}
        onPlaying={() => setPlaying(true)}
        aria-label={alt}
      >
        {webm && <source src={webm} type="video/webm" />}
        {mp4 && <source src={mp4} type="video/mp4" />}
      </video>
      {!playing && <Img name={POSTERS[name]} alt="" className="film-poster" eager={eager} color={color} />}
    </div>
  );
}
