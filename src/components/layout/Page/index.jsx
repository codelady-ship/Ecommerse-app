import React, { useEffect } from 'react';
import Header from '../Header';
import Footer from '../Footer';

// Shared page shell: header, <main>, footer, and a per-page document title.
const Page = ({ title, children, headerProps }) => {
  useEffect(() => {
    document.title = title ? `${title} | Our Boutique` : 'Our Boutique | React e-commerce demo';
  }, [title]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header {...headerProps} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
};

export default Page;
