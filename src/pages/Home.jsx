import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from '../sections/Loader.jsx';
import Hero from '../sections/Hero.jsx';
import Ticker from '../sections/Ticker.jsx';
import StylesGallery from '../sections/StylesGallery.jsx';
import Wardrobe from '../sections/Wardrobe.jsx';
import Rails from '../sections/Rails.jsx';
import Lookbook from '../sections/Lookbook.jsx';
import ColourStory from '../sections/ColourStory.jsx';
import Shop from '../sections/Shop.jsx';
import FilmBand from '../sections/FilmBand.jsx';
import Atelier from '../sections/Atelier.jsx';
import { gsap, revealWithin, ScrollTrigger, scrollToId } from '../lib/motion.js';
import { reducedMotion } from '../lib/format.js';
import { useDocumentMeta } from '../lib/meta.js';

let loaderPlayed = false; // the loader runs once per page load, not on every return to the home route

export default function Home() {
  const root = useRef(null);
  const { hash } = useLocation();
  const [showLoader] = useState(() => !loaderPlayed && !reducedMotion());
  const [ready, setReady] = useState(!showLoader);
  const [style, setStyle] = useState('ALL');

  useDocumentMeta({
    title: 'Hueline Saturation SS27',
    description:
      'HUELINE Saturation SS27: a fictional womenswear lookbook and shop. Six silhouettes, twelve hand-mixed dyes, a 3D wardrobe ring, colour story and Flip-animated shop. Portfolio demo.',
    path: '/',
  });

  const onHandover = useCallback(() => {
    loaderPlayed = true;
    setReady(true);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => revealWithin(root.current), root);
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => {
      window.removeEventListener('load', onLoad);
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (!ready || !hash) return undefined;
    const t = setTimeout(() => scrollToId(hash.slice(1)), 120);
    return () => clearTimeout(t);
  }, [ready, hash]);

  const shopStyle = (code) => {
    setStyle(code);
    scrollToId('shop');
  };

  return (
    <div ref={root} className="home">
      {showLoader && <Loader onHandover={onHandover} />}
      <Hero ready={ready} onShop={() => scrollToId('shop')} />
      <Ticker />
      <StylesGallery onStyle={shopStyle} />
      <Wardrobe />
      <Rails />
      <Lookbook />
      <ColourStory />
      <Shop style={style} setStyle={setStyle} />
      <FilmBand />
      <Atelier />
    </div>
  );
}
