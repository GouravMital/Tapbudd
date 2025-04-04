import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import ContentWizard from '../components/ContentWizard';
import ContentPreview from '../components/ContentPreview';
import RecentContentList from '../components/RecentContentList';
import { DashboardIcons } from '../lib/icons';

export default function Dashboard() {
  const [selectedContent, setSelectedContent] = useState(null);
  
  // Fetch all contents
  const { data: contents, isLoading } = useQuery({
    queryKey: ['/api/contents'],
    staleTime: 60000, // 1 minute
  });
  
  // Calculate stats
  const getStats = () => {
    if (!contents) return { videosGenerated: 0, hoursSaved: 0, studentsReached: 0 };
    
    return {
      videosGenerated: contents.length,
      hoursSaved: contents.length * 2, // Estimate 2 hours saved per video
      studentsReached: contents.length * 25, // Estimate 25 students per video
    };
  };
  
  const stats = getStats();
  
  // Select the most recent content for preview
  useEffect(() => {
    if (contents && contents.length > 0 && !selectedContent) {
      // Sort by creation date descending
      const sortedContents = [...contents].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setSelectedContent(sortedContents[0]);
    }
  }, [contents, selectedContent]);
  
  const handleSelectContent = (content) => {
    setSelectedContent(content);
  };
  
  return (
    <>
      <Header 
        title="AI Content Dashboard" 
        subtitle="Generate educational content for TAPBuddy" 
      />
      
      <div className="p-4 sm:p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            icon={DashboardIcons.video} 
            title="Generated Videos" 
            value={stats.videosGenerated} 
            color="blue" 
          />
          <StatCard 
            icon={DashboardIcons.time} 
            title="Hours Saved" 
            value={stats.hoursSaved} 
            color="green" 
          />
          <StatCard 
            icon={DashboardIcons.user} 
            title="Students Reached" 
            value={stats.studentsReached} 
            color="purple" 
          />
        </div>

        {/* Create New Content Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Create New Content</h2>
            <p className="text-sm text-gray-500">Generate educational videos for TAPBuddy chatbot</p>
          </div>
          
          <ContentWizard />
        </div>

        {/* Generated Content Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Generated Content Preview</h2>
              <p className="text-sm text-gray-500">Review, edit and export your generated content</p>
            </div>
            {selectedContent && (
              <div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded">Ready to Export</span>
              </div>
            )}
          </div>
          
          <ContentPreview content={selectedContent} />
        </div>

        {/* Recent Generated Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Recently Generated Content</h2>
            <p className="text-sm text-gray-500">Your latest AI-generated educational materials</p>
          </div>
          
          {isLoading ? (
            <div className="p-5 text-center">
              <p className="text-gray-500">Loading recent content...</p>
            </div>
          ) : (
            <RecentContentList 
              contents={contents} 
              onSelectContent={handleSelectContent} 
            />
          )}
        </div>
      </div>
    </>
  );
}
