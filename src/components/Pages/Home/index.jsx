import React, { useState } from 'react';
import Page from '../../layout/Page';
import Categories from '../Categories';
import Products from '../Products';

const Home = () => {
  const [searchedText, setSearchedText] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <Page headerProps={{ searchedText, setSearchedText }}>
      <h1 className="text-3xl md:text-4xl font-bold text-green-800">Shop the collection</h1>
      <p className="mt-2 text-gray-700">
        Clothes, electronics, furniture and shoes. Filter by category, search by name and add items to your cart.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <Categories activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        <Products searchedText={searchedText} activeCategory={activeCategory} />
      </div>
    </Page>
  );
};

export default Home;
