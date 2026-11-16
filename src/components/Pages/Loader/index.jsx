import React from 'react';

const Loader = () => (
  <div role="status" className="flex flex-col justify-center items-center min-h-[50vh] gap-2">
    <div className="border-t-4 border-green-600 border-solid w-16 h-16 rounded-full animate-spin" aria-hidden="true"></div>
    <p className="font-bold text-2xl text-emerald-800">Loading...</p>
  </div>
);

export default Loader;
