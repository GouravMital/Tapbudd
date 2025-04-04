import React from 'react';

export default function Header({ title, subtitle }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
          <i className="ri-notification-3-line text-xl"></i>
        </button>
        <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
          <i className="ri-settings-3-line text-xl"></i>
        </button>
      </div>
    </header>
  );
}
