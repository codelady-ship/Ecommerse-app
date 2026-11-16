import React from 'react';

// Read-only star rating (the data has a rating from 0 to 5).
const RatingStar = ({ rating = 0, maxRating = 5 }) => (
  <div className="flex items-center" aria-label={`Rated ${rating} out of ${maxRating}`}>
    {Array.from({ length: maxRating }, (_, i) => (
      <span key={i} aria-hidden="true" className={`text-2xl ${i + 1 <= Math.round(rating) ? 'text-yellow-500' : 'text-gray-300'}`}>
        ★
      </span>
    ))}
    <span className="ml-2 text-lg font-semibold">{rating}/{maxRating}</span>
  </div>
);

export default RatingStar;
