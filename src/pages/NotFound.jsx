import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../lib/meta.js';

export default function NotFound() {
  useDocumentMeta({ title: 'Page not found · Hueline', description: 'This page does not exist.', path: '/404' });
  return (
    <section className="section notfound" aria-labelledby="nf-title">
      <p className="mono-label">404</p>
      <h1 id="nf-title" className="display">
        This colour <em>ran out.</em>
      </h1>
      <p className="lede">The page you are looking for does not exist.</p>
      <Link className="btn btn-ink" to="/">
        Back to the collection
      </Link>
    </section>
  );
}
