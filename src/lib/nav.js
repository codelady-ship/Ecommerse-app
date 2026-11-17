import { useLocation, useNavigate } from 'react-router-dom';
import { scrollToId } from './motion.js';

export const NAV_LINKS = [
  { id: 'wardrobe', label: 'Wardrobe' },
  { id: 'lookbook', label: 'Lookbook' },
  { id: 'colour', label: 'Colour' },
  { id: 'shop', label: 'Shop' },
];

/** Scroll to a home-page section, navigating home first when on another page. */
export function useSectionNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (id) => {
    if (pathname === '/' && scrollToId(id)) return;
    navigate(`/#${id}`);
  };
}
