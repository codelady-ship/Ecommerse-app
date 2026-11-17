// Delivery estimate rules, shared by the API (/api/delivery) and the React app (offline fallback).
// 2 working days for Rajasthan (pincodes 30-34), 3 for metros, 5 elsewhere. Sundays are skipped.
export const FREE_SHIPPING_FROM = 25000;
export const SHIPPING_FEE = 450;
const METROS = ['11', '12', '40', '41', '50', '56', '60', '70'];

export const isPincode = (v) => /^[1-9]\d{5}$/.test(String(v || ''));

export function workingDaysFor(pincode) {
  const p2 = String(pincode).slice(0, 2);
  const n = Number(p2);
  if (n >= 30 && n <= 34) return { days: 2, zone: 'Rajasthan' };
  if (METROS.includes(p2)) return { days: 3, zone: 'Metro' };
  return { days: 5, zone: 'Rest of India' };
}

export function addWorkingDays(from, days) {
  const d = new Date(from.getTime());
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) left -= 1; // skip Sundays
  }
  return d;
}

/** "Tue, 28 Oct" */
export const formatArrival = (d) =>
  d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/^(\w+)\s/, '$1, ');

export function estimateDelivery(pincode, subtotal = 0, now = new Date()) {
  if (!isPincode(pincode)) return null;
  const { days, zone } = workingDaysFor(pincode);
  const date = addWorkingDays(now, days);
  return {
    pincode: String(pincode),
    zone,
    workingDays: days,
    date: date.toISOString().slice(0, 10),
    label: `Arrives by ${formatArrival(date)}`,
    freeShipping: subtotal >= FREE_SHIPPING_FROM,
    shippingFee: subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE,
    freeShippingFrom: FREE_SHIPPING_FROM,
  };
}
