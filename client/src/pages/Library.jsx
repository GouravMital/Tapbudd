import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import Header from '../components/Header';
import { SubjectIcons } from '../lib/icons';

export default function Library() {
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  // Fetch all contents
  const { data: contents, isLoading } = useQuery({
    queryKey: ['/api/contents'],
    staleTime: 60000, // 1 minute
  });
  
  // Filter contents based on selected subject
  const filteredContents = contents 
    ? selectedSubject === 'all' 
      ? contents 
      : contents.filter(content => content.subject === selectedSubject)
    : [];
  
  // Group contents by subject
  const getContentsBySubject = () => {
    if (!contents) return {};
    
    const grouped = {};
    SubjectIcons.forEach(subject => {
      grouped[subject.id] = contents.filter(content => content.subject === subject.id);
    });
    
    return grouped;
  };
  
  const contentsBySubject = getContentsBySubject();
  
  // Handle export of all contents for a subject
  const handleExportSubject = (subjectId) => {
    const subjectContents = contentsBySubject[subjectId] || [];
    
    if (subjectContents.length === 0) {
      toast({
        title: "No content to export",
        description: "There is no content available for this subject.",
        variant: "destructive"
      });
      return;
    }
    
    // Create export data
    const exportData = JSON.stringify(subjectContents, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subjectId}-contents.json`;
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: `All ${subjectId} content has been exported.`
    });
  };
  
  return (
    <>
      <Header 
        title="Content Library" 
        subtitle="Browse and organize your educational content" 
      />
      
      <div className="p-4 sm:p-6">
        {/* Library filter tabs */}
        <div className="flex flex-wrap mb-6 border-b border-gray-200">
          <button 
            onClick={() => setSelectedSubject('all')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              selectedSubject === 'all' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Content
          </button>
          
          {SubjectIcons.map(subject => (
            <button 
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`px-4 py-2 border-b-2 font-medium text-sm ${
                selectedSubject === subject.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>
        
        {/* Library content */}
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading content library...</p>
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="ri-folder-line text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No content found</h3>
            <p className="text-gray-500">
              {selectedSubject === 'all' 
                ? "You haven't generated any content yet." 
                : `No content found for ${selectedSubject.replace('-', ' ')}.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map(content => {
              const subjectIcon = SubjectIcons.find(s => s.id === content.subject) || SubjectIcons[0];
              
              return (
                <div key={content.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`px-4 py-3 ${subjectIcon.bgColor} border-b border-gray-200`}>
                    <div className="flex items-center">
                      {subjectIcon.icon}
                      <span className="font-medium">{subjectIcon.name}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-1">{content.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Age Group: {content.ageGroup} • {content.duration} min {content.contentFormat}
                    </p>
                    
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          content.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          content.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                        </span>
                        
                        <div className="flex space-x-2">
                          <button className="p-1 text-gray-500 hover:text-primary">
                            <i className="ri-eye-line"></i>
                          </button>
                          <button className="p-1 text-gray-500 hover:text-primary">
                            <i className="ri-download-line"></i>
                          </button>
                          <button className="p-1 text-gray-500 hover:text-primary">
                            <i className="ri-share-line"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Export section at the bottom */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Export Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SubjectIcons.map(subject => (
              <button 
                key={subject.id}
                onClick={() => handleExportSubject(subject.id)}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:border-primary hover:bg-blue-50"
              >
                <div className="flex items-center">
                  {subject.icon}
                  <span>{subject.name}</span>
                </div>
                <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
                  {(contentsBySubject[subject.id] || []).length}
                </span>
              </button>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={() => {
                // Export all content
                if (!contents || contents.length === 0) {
                  toast({
                    title: "No content to export",
                    description: "There is no content available to export.",
                    variant: "destructive"
                  });
                  return;
                }
                
                // Create export data
                const exportData = JSON.stringify(contents, null, 2);
                const blob = new Blob([exportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                // Create download link
                const a = document.createElement('a');
                a.href = url;
                a.download = `all-contents.json`;
                a.click();
                
                // Clean up
                URL.revokeObjectURL(url);
                
                toast({
                  title: "Export successful",
                  description: "All content has been exported."
                });
              }}
              className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center justify-center"
            >
              <i className="ri-download-cloud-line mr-1"></i> Export All Content
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
