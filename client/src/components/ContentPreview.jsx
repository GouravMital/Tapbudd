import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { SubjectIcons } from '../lib/icons';

export default function ContentPreview({ content }) {
  const { toast } = useToast();
  
  if (!content) {
    return (
      <div className="p-5 text-center text-gray-500">
        <p>No content selected for preview. Generate content to see it here.</p>
      </div>
    );
  }
  
  // Find subject icon
  const subjectIcon = SubjectIcons.find(s => s.id === content.subject) || SubjectIcons[0];
  
  const handleExportScript = () => {
    // Create a blob of the script text
    const blob = new Blob([content.scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title}-script.txt`;
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast({
      title: "Script Exported",
      description: "Your script has been downloaded as a text file."
    });
  };
  
  const handleExportPackage = () => {
    // Create a JSON representation of the full content
    const packageData = JSON.stringify(content, null, 2);
    const blob = new Blob([packageData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title}-full-package.json`;
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast({
      title: "Full Package Exported",
      description: "Your content package has been downloaded as a JSON file."
    });
  };
  
  const handleSendToTAPBuddy = () => {
    toast({
      title: "Content Sent to TAPBuddy",
      description: "Your content has been successfully sent to TAPBuddy."
    });
  };
  
  return (
    <div className="p-5">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
        <div className="flex items-center mb-3">
          <div className={`w-8 h-8 rounded-full ${subjectIcon.bgColor} flex items-center justify-center`}>
            {subjectIcon.icon}
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-800">{subjectIcon.name}: {content.title}</h3>
            <p className="text-xs text-gray-500">
              Age Group: {content.ageGroup} • Difficulty: {content.difficultyLevel} • Duration: {content.duration}
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Script Overview</h4>
          <div className="bg-white border border-gray-200 rounded-md p-3 mb-3 text-sm text-gray-600 max-h-32 overflow-y-auto">
            <p className="whitespace-pre-line">{content.scriptContent}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Learning Objectives</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 bg-white border border-gray-200 rounded-md p-3">
                {content.learningObjectives && content.learningObjectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Materials Needed</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 bg-white border border-gray-200 rounded-md p-3">
                {content.materials && content.materials.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>
          </div>
          
          {content.visualReferences && content.visualReferences.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Visual References</h4>
              <div className="grid grid-cols-3 gap-3">
                {content.visualReferences.map((reference, index) => (
                  <div key={index} className="relative aspect-video bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="ri-image-line text-2xl text-gray-400"></i>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1">
                      <p className="text-xs text-white">{reference.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 justify-end">
        <button 
          type="button" 
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <i className="ri-edit-line mr-1"></i> Edit Content
        </button>
        <button 
          type="button" 
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <i className="ri-refresh-line mr-1"></i> Regenerate
        </button>
        <button 
          type="button" 
          onClick={handleExportScript}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <i className="ri-file-text-line mr-1"></i> Export Script
        </button>
        <button 
          type="button" 
          onClick={handleExportPackage}
          className="inline-flex items-center px-3 py-2 border border-primary text-sm font-medium rounded-md text-primary bg-white hover:bg-blue-50"
        >
          <i className="ri-download-line mr-1"></i> Export Full Package
        </button>
        <button 
          type="button" 
          onClick={handleSendToTAPBuddy}
          className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
        >
          <i className="ri-whatsapp-line mr-1"></i> Send to TAPBuddy
        </button>
      </div>
    </div>
  );
}
