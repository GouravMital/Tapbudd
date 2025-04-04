import React from 'react';

export default function StatCard({ icon, title, value, color = "blue" }) {
  const colorClasses = {
    blue: "bg-blue-50 text-primary",
    green: "bg-green-50 text-success",
    purple: "bg-purple-50 text-secondary",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600"
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-md ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-xl font-semibold text-gray-800">{value}</h3>
        </div>
      </div>
    </div>
  );
}
