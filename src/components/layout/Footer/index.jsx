import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-green-800 text-white mt-10">
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-sm">
      <p>
        © {new Date().getFullYear()} Our Boutique · A demo store built with React. No real orders are taken.
      </p>
      <nav aria-label="Footer" className="flex flex-wrap gap-4">
        <Link to="/about" className="hover:text-yellow-300">About</Link>
        <Link to="/services" className="hover:text-yellow-300">Services</Link>
        <Link to="/contact" className="hover:text-yellow-300">Contact</Link>
        <a href="https://github.com/codelady-ship/Ecommerse-app" className="hover:text-yellow-300" target="_blank" rel="noreferrer">
          Source on GitHub
        </a>
      </nav>
    </div>
  </footer>
);

export default Footer;
