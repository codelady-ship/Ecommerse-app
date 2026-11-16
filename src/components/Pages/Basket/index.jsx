import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Page from '../../layout/Page';
import UseBasket, { basketCount, basketTotal } from '../Store/Basket';

const Basket = () => {
  const { basket, changeCount, removeProduct, clearBasket } = UseBasket();
  const total = basketTotal(basket);

  const handleRemove = (id, title) => {
    removeProduct(id);
    toast(`${title} removed from cart`);
  };

  const handleCheckout = () => {
    clearBasket();
    toast.success('Demo checkout complete. This store takes no payments and ships nothing.', { duration: 5000 });
  };

  return (
    <Page title="Cart">
      <h1 className="text-3xl font-bold text-green-800">My cart</h1>

      {basket.length === 0 ? (
        <div className="my-10 text-center">
          <p className="text-lg text-gray-700">Your cart is empty.</p>
          <Link to="/" className="mt-4 inline-block px-5 py-2 rounded bg-green-700 text-white font-semibold hover:bg-green-800">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-6 space-y-4">
            {basket.map(({ id, title, slug, image, price, count }) => (
              <li key={id} className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row gap-4 sm:items-center">
                <img src={image} alt={title} className="w-full sm:w-28 h-40 sm:h-28 object-cover rounded" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold">
                    <Link to={`/products/${slug}`} className="hover:text-green-700">{title}</Link>
                  </h2>
                  <p className="text-gray-600">${price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-green-600 text-white disabled:opacity-40"
                    onClick={() => changeCount(id, '-')}
                    disabled={count <= 1}
                    aria-label={`Decrease quantity of ${title}`}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold" aria-live="polite">{count}</span>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-green-600 text-white"
                    onClick={() => changeCount(id, '+')}
                    aria-label={`Increase quantity of ${title}`}
                  >
                    +
                  </button>
                </div>
                <p className="sm:w-24 font-bold text-green-800 sm:text-right">${price * count}</p>
                <button
                  type="button"
                  className="self-start sm:self-center p-2 text-red-600 hover:text-red-800"
                  onClick={() => handleRemove(id, title)}
                  aria-label={`Remove ${title} from cart`}
                >
                  <FaTrash size={20} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 bg-white border rounded-lg p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <p className="text-xl font-bold text-green-800">
              Total ({basketCount(basket)} items): ${total}
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="px-4 py-2 rounded border border-green-700 text-green-800" onClick={clearBasket}>
                Clear cart
              </button>
              <button type="button" className="px-4 py-2 rounded bg-green-700 text-white font-semibold hover:bg-green-800" onClick={handleCheckout}>
                Checkout (demo)
              </button>
            </div>
          </div>
        </>
      )}
    </Page>
  );
};

export default Basket;
