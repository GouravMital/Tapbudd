import React from 'react';
import { SubjectIcons } from '../lib/icons';

export default function SubjectSelector({ selectedSubject, onSelectSubject }) {
  return (
    <div className="mb-6">
      <h3 className="text-md font-medium text-gray-700 mb-3">1. Select Subject Area</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {SubjectIcons.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            className={`relative flex flex-col items-center p-4 bg-white border-2 ${
              selectedSubject === subject.id ? 'border-primary' : 'border-gray-200'
            } rounded-lg hover:border-primary focus:outline-none focus:ring focus:ring-blue-200 transition-all`}
          >
            <div className={`w-12 h-12 rounded-full ${subject.bgColor} flex items-center justify-center mb-3`}>
              {subject.iconLarge}
            </div>
            <span className="text-sm font-medium">{subject.name}</span>
            <div className={`absolute top-2 right-2 ${selectedSubject === subject.id ? '' : 'hidden'}`}>
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <i className="ri-check-line text-xs text-white"></i>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
