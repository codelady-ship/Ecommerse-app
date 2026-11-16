import React from 'react';
import { Link } from 'react-router-dom';
import Page from '../../layout/Page';

const services = [
  {
    title: 'Easy browsing',
    text: 'Products are grouped into Clothes, Electronics, Furniture, Shoes and Miscellaneous. Pick a category or type a name in the search box to narrow the list.',
  },
  {
    title: 'Detailed product pages',
    text: 'Every product has its own page with several photos, a description, the category, a star rating and the price.',
  },
  {
    title: 'A cart that remembers',
    text: 'Items you add stay in your cart after a reload because the cart is stored in your browser (localStorage). You can change quantities or remove items at any time.',
  },
  {
    title: 'Demo checkout',
    text: 'The checkout button shows how the flow ends without taking any payment. This is a portfolio demo, so no orders are shipped.',
  },
  {
    title: 'Works on any screen',
    text: 'The layout adapts from phones to large monitors, with a mobile menu on small screens.',
  },
];

const Services = () => (
  <Page title="Services">
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-green-800">What the store offers</h1>
      <p className="mt-3 text-lg text-gray-700">
        Our Boutique is a demo shop. These are the features you can try on this site.
      </p>
      <ul className="mt-8 grid gap-5 md:grid-cols-2">
        {services.map(({ title, text }) => (
          <li key={title} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-700">{title}</h2>
            <p className="mt-2 text-gray-700">{text}</p>
          </li>
        ))}
      </ul>
      <Link to="/" className="mt-8 inline-block px-5 py-2 rounded bg-green-700 text-white font-semibold hover:bg-green-800">
        Back to all products
      </Link>
    </div>
  </Page>
);

export default Services;
