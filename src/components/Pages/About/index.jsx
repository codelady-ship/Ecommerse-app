import React from 'react';
import { Link } from 'react-router-dom';
import Page from '../../layout/Page';

const About = () => (
  <Page title="About">
    <article className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6 md:p-10">
      <h1 className="text-3xl font-bold text-green-800">About Our Boutique</h1>
      <p className="mt-4 text-lg text-gray-700">
        Our Boutique is a small online shop for everyday things: clothes, electronics, furniture, shoes and a few
        extras. It is a demo store, built as a front-end portfolio project, so you can browse and fill a cart, but no
        real orders are placed.
      </p>

      <h2 className="mt-8 text-2xl font-semibold text-green-700">Why this project exists</h2>
      <p className="mt-3 text-lg text-gray-700">
        The goal was to build a complete shopping flow in React without a backend: a product catalogue loaded from a
        JSON file, category filters, search, pagination, product pages with an image gallery, and a cart that keeps
        its contents after you reload the page.
      </p>

      <h2 className="mt-8 text-2xl font-semibold text-green-700">What you can do here</h2>
      <ul className="mt-3 list-disc pl-6 text-lg text-gray-700 space-y-1">
        <li>Browse 41 sample products in five categories.</li>
        <li>Search by product name and filter by category.</li>
        <li>Open a product to see its photos, rating and price.</li>
        <li>Add items to the cart, change quantities and remove them. The cart is saved in your browser.</li>
        <li>Try the demo checkout. Nothing is charged or shipped.</li>
      </ul>

      <h2 className="mt-8 text-2xl font-semibold text-green-700">Built with</h2>
      <p className="mt-3 text-lg text-gray-700">
        <span translate="no">React</span>, <span translate="no">React Router</span>,{' '}
        <span translate="no">Zustand</span>, <span translate="no">Tailwind CSS</span> and{' '}
        <span translate="no">Vite</span>, deployed on <span translate="no">GitHub Pages</span>. Sample product data
        is based on the Platzi Fake Store API.
      </p>

      <Link to="/" className="mt-8 inline-block px-5 py-2 rounded bg-green-700 text-white font-semibold hover:bg-green-800">
        Start shopping
      </Link>
    </article>
  </Page>
);

export default About;
