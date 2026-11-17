import { forwardRef } from 'react';
import { Img } from './Media.jsx';
import { inr } from '../lib/format.js';

/**
 * Product card. The whole card is a [data-product] target: clicking it opens the quick view
 * (delegated in App). Hover swaps the photo to the second view.
 */
const ProductCard = forwardRef(function ProductCard({ p, className = '', hidden = false, eager = false }, ref) {
  const second = p.images[1] || p.images[0];
  return (
    <article
      ref={ref}
      className={`card ${className}`}
      data-product={p.code}
      data-flip-id={p.code}
      data-cursor="color"
      data-cursor-label="View"
      style={{ '--cc': p.colourHex, display: hidden ? 'none' : undefined }}
    >
      <div className="card-media">
        <Img name={p.images[0]} alt={`${p.name} in ${p.colour}`} color={p.colourHex} eager={eager} className="card-img" />
        <Img
          name={second}
          alt=""
          color={p.colourHex}
          className="card-img card-img-2"
          pos={p.images[1] ? '50% 40%' : '50% 20%'}
          zoom={p.images[1] ? 1 : 1.5}
        />
      </div>
      <div className="card-body">
        <h3 className="card-name">
          <button type="button" className="card-hit" aria-label={`Quick view: ${p.name}, ${inr(p.price)}`}>
            {p.name}
          </button>
        </h3>
        <p className="card-fabric">{p.fabric}</p>
        <p className="card-price">
          <span className="dot" style={{ background: p.colourHex }} aria-hidden="true" />
          {inr(p.price)}
        </p>
      </div>
    </article>
  );
});

export default ProductCard;
