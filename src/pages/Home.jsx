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
import { absolute, SITE, useDocumentMeta, useJsonLd } from '../lib/meta.js';
import { src } from '../data/catalog.js';
import { useCatalog } from '../lib/store.js';

let loaderPlayed = false; // the loader runs once per page load, not on every return to the home route

export default function Home() {
  const root = useRef(null);
  const { hash } = useLocation();
  const [showLoader] = useState(() => !loaderPlayed && !reducedMotion());
  const [ready, setReady] = useState(!showLoader);
  const [style, setStyle] = useState('ALL');

  useDocumentMeta({
    title: 'Hueline SS27 · Hand-Dyed Womenswear Lookbook & Shop',
    description:
      'HUELINE Saturation SS27: a fictional hand-dyed womenswear lookbook and shop with six silhouettes, twelve dyes and 24 pieces. Portfolio demo, no real payments.',
    path: '/',
  });

  // The pieces listed in the shop section (names, colours, fabrics and photos are all on the page).
  const products = useCatalog((s) => s.products);
  useJsonLd('home-shop', {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'HUELINE Saturation SS27 collection',
    url: `${SITE}/#shop`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        sku: p.code,
        color: p.colour,
        material: p.fabric,
        category: p.styleLabel,
        image: absolute(src(p.images[0])),
        brand: { '@type': 'Brand', name: 'HUELINE' },
      },
    })),
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
