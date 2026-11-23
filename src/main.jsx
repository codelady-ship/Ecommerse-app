import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'lenis/dist/lenis.css';
import './styles/shared.css';
import App from './App.jsx';

// GitHub Pages serves /product, /checkout and /admin from copies of index.html (scripts/postbuild.mjs) and any
// other path through 404.html, also a copy of index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
