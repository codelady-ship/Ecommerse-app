import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Page from '../../layout/Page';
import RatingStar from './RatingStar';
import NotFound from '../Error404';
import Loader from '../Loader';
import UseBasket from '../Store/Basket';
import { getCatalog } from '../../../api';

const ProductsDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [status, setStatus] = useState('loading'); // loading | ready | missing | error
  const addToBasket = UseBasket((s) => s.addToBasket);
  const inBasket = UseBasket((s) => s.basket.find((p) => p.id === product?.id)?.count ?? 0);

  useEffect(() => {
    setStatus('loading');
    getCatalog()
      .then((data) => {
        const found = data.products.find((p) => p.slug === slug);
        if (!found) {
          setStatus('missing');
          return;
        }
        setProduct(found);
        setCurrentImage(found.images[0]);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [slug]);

  if (status === 'missing') return <NotFound />;

  const handleAdd = () => {
    addToBasket(product);
    toast.success(`${product.title} added to cart`);
  };

  return (
    <Page title={product?.title}>
      <Link to="/" className="inline-block mb-4 text-green-800 font-semibold hover:underline">
        ← Back to all products
      </Link>

      {status === 'loading' && <Loader />}
      {status === 'error' && (
        <p role="alert" className="text-red-700 font-semibold">This product could not be loaded. Please refresh the page.</p>
      )}

      {status === 'ready' && (
        <article className="grid gap-8 md:grid-cols-2">
          <div>
            <img
              src={currentImage}
              alt={product.title}
              className="w-full aspect-square object-cover rounded-lg"
              width="600"
              height="600"
            />
            <div className="mt-2 grid grid-cols-3 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setCurrentImage(image)}
                  aria-label={`Show image ${index + 1} of ${product.title}`}
                  className={`rounded-lg overflow-hidden border-2 p-0 ${image === currentImage ? 'border-green-700' : 'border-transparent'}`}
                >
                  <img src={image} alt="" className="w-full aspect-square object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-green-800">{product.title}</h1>
            <p className="mt-2 text-gray-600">Category: {product.category.name}</p>
            <div className="mt-3">
              <RatingStar rating={product.rating} />
            </div>
            <p className="mt-4 text-3xl font-bold text-green-800">${product.price}</p>
            <p className="mt-4 text-gray-700 leading-relaxed">{product.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="px-5 py-2 font-bold text-white rounded bg-green-700 hover:bg-green-800"
                onClick={handleAdd}
              >
                Add to cart
              </button>
              {inBasket > 0 && (
                <Link to="/cart" className="text-green-800 font-semibold hover:underline">
                  {inBasket} in cart. View cart →
                </Link>
              )}
            </div>
          </div>
        </article>
      )}
    </Page>
  );
};

export default ProductsDetail;
