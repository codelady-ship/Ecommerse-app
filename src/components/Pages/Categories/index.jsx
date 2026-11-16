import React, { useEffect, useState } from 'react';
import { getCatalog } from '../../../api';

const Categories = ({ activeCategory, setActiveCategory }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCatalog()
      .then((data) => setCategories(data.categories ?? []))
      .catch((err) => console.error('Error loading categories:', err));
  }, []);

  const names = ['All', ...categories.map(({ name }) => name)];

  return (
    <aside aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="text-xl font-bold text-white rounded p-2 bg-green-800">
        Categories
      </h2>
      <ul className="mt-2 flex flex-wrap gap-2 lg:flex-col">
        {names.map((name) => (
          <li key={name}>
            <button
              type="button"
              aria-pressed={activeCategory === name}
              onClick={() => setActiveCategory(name)}
              className={`w-full text-left px-3 py-1.5 rounded text-base ${
                activeCategory === name ? 'bg-yellow-300 text-green-900 font-semibold' : 'bg-green-700 text-white hover:bg-green-600'
              }`}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Categories;
