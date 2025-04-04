import { Link, useLocation } from "wouter";
import { useSidebar } from "../contexts/SidebarContext";
import { SubjectIcons } from "../lib/icons";

export default function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const [location] = useLocation();
  
  const isActive = (path) => location === path;
  
  return (
    <aside className={`bg-white w-64 border-r border-gray-200 ${isOpen ? 'fixed inset-0 z-50' : 'hidden'} md:block`}>
      <div className="h-full flex flex-col">
        {/* Mobile close button */}
        {isOpen && (
          <button 
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 md:hidden"
            onClick={toggleSidebar}
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        )}
        
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
              <i className="ri-vidicon-line text-xl"></i>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-800">TAPContent</h1>
              <p className="text-xs text-gray-500">AI Content Generator</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-3">Navigation</p>
          <ul className="space-y-1">
            <li>
              <Link 
                href="/" 
                className={`sidebar-menu-item flex items-center p-3 text-gray-800 font-medium ${isActive('/') ? 'active' : ''}`}
                onClick={() => isOpen && toggleSidebar()}
              >
                <i className={`ri-dashboard-line mr-3 ${isActive('/') ? 'text-primary' : 'text-gray-600'}`}></i>
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/generated-content" 
                className={`sidebar-menu-item flex items-center p-3 text-gray-800 font-medium ${isActive('/generated-content') ? 'active' : ''}`}
                onClick={() => isOpen && toggleSidebar()}
              >
                <i className={`ri-film-line mr-3 ${isActive('/generated-content') ? 'text-primary' : 'text-gray-600'}`}></i>
                Generated Content
              </Link>
            </li>
            <li>
              <Link 
                href="/library" 
                className={`sidebar-menu-item flex items-center p-3 text-gray-800 font-medium ${isActive('/library') ? 'active' : ''}`}
                onClick={() => isOpen && toggleSidebar()}
              >
                <i className={`ri-folder-line mr-3 ${isActive('/library') ? 'text-primary' : 'text-gray-600'}`}></i>
                Library
              </Link>
            </li>
          </ul>
          
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-8 mb-2 px-3">Subject Areas</p>
          <ul className="space-y-1">
            {SubjectIcons.map((subject) => (
              <li key={subject.id}>
                <Link
                  href={`/?subject=${subject.id}`}
                  className="sidebar-menu-item flex items-center p-3 text-gray-800 font-medium"
                  onClick={() => isOpen && toggleSidebar()}
                >
                  {subject.icon}
                  {subject.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <i className="ri-user-line text-gray-500"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Sarah Johnson</p>
              <p className="text-xs text-gray-500">Content Creator</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
