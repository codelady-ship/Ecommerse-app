import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import { reducedMotion } from './format.js';

gsap.registerPlugin(ScrollTrigger, Flip);
gsap.defaults({ ease: 'expo.out' });

export { gsap, ScrollTrigger, Flip };

let lenis = null;
let locks = 0;

/** Lenis smooth scroll driving ScrollTrigger (skipped for reduced motion). */
export function initLenis() {
  if (lenis || reducedMotion()) return lenis;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const getLenis = () => lenis;

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) lenis.scrollTo(el, { offset: -60 });
  else el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
  return true;
}

/** Lock page scroll while an overlay (or the loader) is open. Nested locks are counted. */
export function lockScroll(on) {
  locks = Math.max(0, locks + (on ? 1 : -1));
  const locked = locks > 0;
  document.documentElement.classList.toggle('is-locked', locked);
  if (lenis) (locked ? lenis.stop() : lenis.start());
}

/** Masked line reveals, word reveals and image wipes for everything inside `root`. */
export function revealWithin(root) {
  if (reducedMotion()) return;
  root.querySelectorAll('[data-mask]').forEach((el) => {
    gsap.from(el.querySelectorAll('.ml-i'), {
      yPercent: 110,
      duration: 1.1,
      stagger: 0.08,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
  root.querySelectorAll('[data-lines]').forEach((el) => {
    gsap.from(el.querySelectorAll('.w'), {
      yPercent: 100,
      opacity: 0,
      duration: 0.8,
      stagger: 0.012,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
  root.querySelectorAll('[data-reveal="img"]').forEach((el) => {
    const img = el.querySelector('img, .dye-block');
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' });
    if (img) tl.from(img, { scale: 1.35, duration: 1.6, ease: 'expo.out' }, 0.1);
  });
}
