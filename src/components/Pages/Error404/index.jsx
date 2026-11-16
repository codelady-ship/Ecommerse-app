import React from 'react';
import { Link } from 'react-router-dom';
import Page from '../../layout/Page';

const NotFound = () => (
  <Page title="Page not found">
    <div className="py-16 text-center">
      <h1 className="text-7xl font-bold text-green-900">404</h1>
      <p className="mt-6 text-2xl text-gray-700">Page not found</p>
      <p className="mt-3 text-lg text-gray-500">Sorry, this page does not exist.</p>
      <Link to="/" className="mt-6 inline-block px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800">
        Back to the shop
      </Link>
    </div>
  </Page>
);

export default NotFound;
