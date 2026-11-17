import { useEffect, useRef, useState } from 'react';
import { POSTERS, VIDEO_ALT, dimsOf, src, videoSrc } from '../data/catalog.js';
import { reducedMotion } from '../lib/format.js';

/**
 * Photo with the spec's fallback chain: the named photo, then `fallback` (usually the product's own
 * photo), then a block filled with the dye colour. Bundled photos get width/height attributes so the
 * browser reserves their box before they load. `eager` skips lazy loading; `priority` marks the LCP photo.
 */
export function Img({ name, fallback, alt, color = '#16141a', pos = '50% 40%', zoom = 1, className = '', eager = false, priority = false, sizes }) {
  const first = src(name) || src(fallback);
  const [url, setUrl] = useState(first);
  useEffect(() => setUrl(src(name) || src(fallback)), [name, fallback]);
  const style = { objectPosition: pos, ...(zoom !== 1 ? { transform: `scale(${zoom})`, transformOrigin: pos } : null) };
  if (!url) {
    return <div className={`dye-block ${className}`} style={{ background: color }} role="img" aria-label={alt} />;
  }
  const dims = url === src(name) ? dimsOf(name) : dimsOf(fallback);
  return (
    <img
      className={className}
      src={url}
      alt={alt}
      width={dims?.[0]}
      height={dims?.[1]}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      sizes={sizes}
      style={style}
      draggable="false"
      onError={() => setUrl((u) => (u !== src(fallback) && src(fallback) ? src(fallback) : null))}
    />
  );
}

/**
 * Film slot: plays the clip for `name` (see LOCAL_VIDEOS in data/catalog.js) muted, looped and inline,
 * with its poster photo on top until the video fires 'playing'. Without a clip, or when the visitor
 * prefers reduced motion, only the poster photo is shown. `active=false` pauses it.
 */
export function Film({ name, alt, className = '', active = true, eager = false, color }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const webm = videoSrc(name, 'webm');
  const mp4 = videoSrc(name, 'mp4');
  const [reduced] = useState(reducedMotion);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active]);

  if ((!webm && !mp4) || reduced) {
    return <Img name={POSTERS[name]} alt={alt} className={className} eager={eager} priority={eager} color={color} pos="50% 35%" />;
  }
  return (
    <div className={`film ${className}`}>
      <video
        ref={ref}
        muted
        loop
        playsInline
        autoPlay={active}
        preload={active ? 'metadata' : 'none'}
        poster={src(POSTERS[name]) || undefined}
        onPlaying={() => setPlaying(true)}
        aria-label={alt ? VIDEO_ALT[name] || alt : undefined}
        aria-hidden={alt ? undefined : 'true'}
        disablePictureInPicture
      >
        {webm && <source src={webm} type="video/webm" />}
        {mp4 && <source src={mp4} type="video/mp4" />}
      </video>
      {!playing && <Img name={POSTERS[name]} alt="" className="film-poster" eager={eager} priority={eager} color={color} />}
    </div>
  );
}
