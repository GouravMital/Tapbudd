import React from 'react';
import { useSidebar } from '../contexts/SidebarContext';

export default function MobileSidebarToggle() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <div className="md:hidden fixed bottom-6 right-6 z-50">
      <button 
        type="button" 
        onClick={toggleSidebar}
        className="bg-primary text-white p-3 rounded-full shadow-lg"
      >
        <i className="ri-menu-line text-xl"></i>
      </button>
    </div>
  );
}
