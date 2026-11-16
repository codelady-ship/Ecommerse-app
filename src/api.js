// Product catalogue lives in public/data.json and is served next to index.html.
// BASE_URL is "/Ecommerse-app/" in production and "/" in dev, so this resolves on every route.
export const DATA_URL = `${import.meta.env.BASE_URL}data.json`;

let catalogPromise;

// Fetch the catalogue once and share the result between Products, Categories and ProductsDetail.
export function getCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${DATA_URL} (${res.status})`);
        return res.json();
      })
      .catch((err) => {
        catalogPromise = undefined; // allow a retry on the next call
        throw err;
      });
  }
  return catalogPromise;
}
