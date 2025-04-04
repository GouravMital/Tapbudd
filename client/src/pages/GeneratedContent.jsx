import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import Header from '../components/Header';
import RecentContentList from '../components/RecentContentList';
import ContentPreview from '../components/ContentPreview';

export default function GeneratedContent() {
  const { toast } = useToast();
  const [selectedContent, setSelectedContent] = useState(null);
  
  // Fetch all contents
  const { data: contents, isLoading, isError, error } = useQuery({
    queryKey: ['/api/contents'],
    staleTime: 60000, // 1 minute
  });
  
  const handleSelectContent = (content) => {
    setSelectedContent(content);
  };
  
  const handleDeleteContent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }
    
    try {
      await apiRequest('DELETE', `/api/contents/${id}`);
      
      // Invalidate query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/contents'] });
      
      // Reset selected content if it was deleted
      if (selectedContent && selectedContent.id === id) {
        setSelectedContent(null);
      }
      
      toast({
        title: 'Content deleted',
        description: 'The content has been permanently deleted.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to delete content: ${error.message}`,
        variant: 'destructive'
      });
    }
  };
  
  return (
    <>
      <Header 
        title="Generated Content" 
        subtitle="Browse and manage your AI-generated educational materials" 
      />
      
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Generated Content</h2>
                  <p className="text-sm text-gray-500">All your generated educational materials</p>
                </div>
                
                <div className="flex space-x-2">
                  <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                    <option value="all">All Subjects</option>
                    <option value="visual-arts">Visual Arts</option>
                    <option value="performing-arts">Performing Arts</option>
                    <option value="coding">Coding</option>
                    <option value="financial-literacy">Financial Literacy</option>
                    <option value="science">Science</option>
                  </select>
                  
                  <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                    <option value="in-review">In Review</option>
                  </select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="p-5 text-center">
                  <p className="text-gray-500">Loading content...</p>
                </div>
              ) : isError ? (
                <div className="p-5 text-center">
                  <p className="text-red-500">Error loading content: {error.message}</p>
                </div>
              ) : (
                <RecentContentList 
                  contents={contents} 
                  onSelectContent={handleSelectContent} 
                />
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Content Preview</h2>
                <p className="text-sm text-gray-500">
                  {selectedContent ? selectedContent.title : 'Select content to preview'}
                </p>
              </div>
              
              <ContentPreview content={selectedContent} />
              
              {selectedContent && (
                <div className="p-5 border-t border-gray-200">
                  <button 
                    onClick={() => handleDeleteContent(selectedContent.id)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <i className="ri-delete-bin-line mr-1"></i> Delete Content
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
