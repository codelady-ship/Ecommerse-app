import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import UseBasket, { basketCount } from '../../Pages/Store/Basket';

const links = [
  { id: 0, title: 'Shop', href: '/' },
  { id: 1, title: 'About', href: '/about' },
  { id: 2, title: 'Services', href: '/services' },
  { id: 3, title: 'Contact', href: '/contact' },
];

const navClass = ({ isActive }) =>
  `text-lg ${isActive ? 'text-yellow-300 underline underline-offset-4' : 'text-white'} hover:text-yellow-300`;

// searchedText / setSearchedText are only passed on the shop page, so the search box only shows there.
const Header = ({ searchedText, setSearchedText }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const count = UseBasket((s) => basketCount(s.basket));
  const showSearch = typeof setSearchedText === 'function';

  return (
    <header className="bg-green-800 text-white relative">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        <Link to="/" className="text-2xl font-bold text-white hover:text-yellow-300 mr-auto">
          Our Boutique
        </Link>

        <nav aria-label="Main" className="hidden md:flex gap-6">
          {links.map(({ id, title, href }) => (
            <NavLink key={id} to={href} end className={navClass}>
              {title}
            </NavLink>
          ))}
        </nav>

        <NavLink to="/cart" className="relative p-1 text-white hover:text-yellow-300" aria-label={`Cart, ${count} items`}>
          <FaShoppingCart size={24} aria-hidden="true" />
          <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
            {count}
          </span>
        </NavLink>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="md:hidden p-1 text-white"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <HiX size={30} /> : <HiOutlineMenuAlt3 size={30} />}
        </button>

        {showSearch && (
          <div className="w-full md:w-auto md:order-none">
            <label htmlFor="search" className="sr-only">Search products</label>
            <input
              id="search"
              type="search"
              placeholder="Search products"
              className="w-full md:w-64 rounded px-3 py-1.5 bg-white text-gray-900 placeholder:text-gray-500"
              value={searchedText}
              onChange={(e) => setSearchedText(e.target.value)}
            />
          </div>
        )}
      </div>

      {isMenuOpen && (
        <nav id="mobile-menu" aria-label="Mobile" className="md:hidden border-t border-green-700 bg-green-800 px-4 pb-4">
          {links.map(({ id, title, href }) => (
            <NavLink
              key={id}
              to={href}
              end
              onClick={() => setIsMenuOpen(false)}
              className={(state) => `block py-2 ${navClass(state)}`}
            >
              {title}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
