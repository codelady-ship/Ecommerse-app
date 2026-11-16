import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getCatalog } from '../../../api';
import DataNotFound from '../DataNotFound';
import Loader from '../Loader';

const PER_PAGE = 8;

const Products = ({ searchedText, activeCategory }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(1);

  useEffect(() => {
    getCatalog()
      .then((data) => setProducts(data.products ?? []))
      .catch((err) => {
        console.error(err);
        setError('Products could not be loaded. Please refresh the page.');
        toast.error('Error loading products.');
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const text = searchedText?.trim().toLowerCase();
    return products.filter(
      ({ title, category }) =>
        (!text || title.toLowerCase().includes(text)) &&
        (activeCategory === 'All' || category.name === activeCategory)
    );
  }, [products, searchedText, activeCategory]);

  // Go back to page 1 whenever the filter changes.
  useEffect(() => setActivePage(1), [searchedText, activeCategory]);

  if (loading) return <Loader />;
  if (error) return <p role="alert" className="text-center text-red-700 font-semibold py-10">{error}</p>;

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((activePage - 1) * PER_PAGE, activePage * PER_PAGE);

  return (
    <section aria-labelledby="products-heading">
      <h2 id="products-heading" className="text-2xl font-semibold text-green-800">
        {activeCategory === 'All' ? 'All products' : activeCategory}
        <span className="ml-2 text-base font-normal text-gray-600">({filtered.length})</span>
      </h2>

      {visible.length === 0 ? (
        <DataNotFound />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 my-6">
          {visible.map(({ id, title, images, category, description, slug, price }) => (
            <li key={id} className="relative bg-white border border-green-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <img src={images[0]} className="object-cover h-60 w-full" alt={title} loading="lazy" width="400" height="240" />
              <span className="absolute top-2 right-2 px-2 py-0.5 text-sm font-bold bg-green-800 text-white rounded">
                {category.name}
              </span>
              <div className="p-3">
                <h3 className="text-lg font-semibold truncate">
                  <Link to={`/products/${slug}`} className="after:absolute after:inset-0 hover:text-green-700">
                    {title}
                  </Link>
                </h3>
                <p className="my-2 line-clamp-2 text-sm text-gray-700">{description}</p>
                <p className="font-extrabold text-green-800">${price}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              aria-current={activePage === page ? 'page' : undefined}
              className={`min-w-9 px-2 py-1 rounded text-white ${activePage === page ? 'bg-green-900' : 'bg-green-600 hover:bg-green-700'}`}
              onClick={() => {
                setActivePage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {page}
            </button>
          ))}
        </nav>
      )}
    </section>
  );
};

export default Products;
