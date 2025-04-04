import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { SubjectIcons } from '../lib/icons';
import ContentVideo from './ContentVideo';

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
    // Format the script content
    let scriptText = '';
    
    if (!content.scriptContent) {
      scriptText = 'No script content available';
    } else if (typeof content.scriptContent === 'string') {
      scriptText = content.scriptContent;
    } else if (content.scriptContent && typeof content.scriptContent === 'object') {
      const { opening, mainContent, conclusion } = content.scriptContent;
      
      // Add opening section
      if (opening) {
        scriptText += "===== OPENING =====\n" + opening + "\n\n";
      }
      
      // Add main content sections
      if (mainContent) {
        scriptText += "===== MAIN CONTENT =====\n";
        
        if (Array.isArray(mainContent)) {
          // For sectioned content format (with sectionTitle, script, interactiveElement)
          mainContent.forEach((section, index) => {
            scriptText += `\n--- SECTION ${index + 1}: ${section.sectionTitle || 'Untitled'} ---\n\n`;
            scriptText += section.script || '';
            
            if (section.interactiveElement) {
              scriptText += '\n\nInteractive Element: ' + section.interactiveElement;
            }
            
            scriptText += '\n\n';
          });
        } else if (typeof mainContent === 'string') {
          // For simple string content
          scriptText += mainContent + '\n\n';
        }
      }
      
      // Add conclusion section
      if (conclusion) {
        scriptText += "===== CONCLUSION =====\n" + conclusion;
      }
    }
    
    // Create a blob of the script text
    const blob = new Blob([scriptText], { type: 'text/plain' });
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
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">
                Age Group: {content.ageGroup} • Difficulty: {content.difficultyLevel} • Duration: {content.duration}
              </p>
              {content.aiModel && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  content.aiModel === 'groq' 
                    ? 'bg-blue-100 text-blue-800' 
                    : content.aiModel === 'gemini'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {content.aiModel === 'groq' && (
                    <><i className="ri-robot-line mr-1"></i>GROQ</>
                  )}
                  {content.aiModel === 'gemini' && (
                    <><i className="ri-google-line mr-1"></i>Gemini</>
                  )}
                  {!['groq', 'gemini'].includes(content.aiModel) && content.aiModel}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          {/* Video component */}
          <ContentVideo content={content} />

          <h4 className="text-sm font-medium text-gray-700 mb-2">Script Overview</h4>
          <div className="bg-white border border-gray-200 rounded-md p-3 mb-3 text-sm text-gray-600 max-h-64 overflow-y-auto">
            {!content.scriptContent ? (
              <p>No script content available</p>
            ) : typeof content.scriptContent === 'string' ? (
              <p className="whitespace-pre-line">{content.scriptContent}</p>
            ) : (
              <div>
                {/* Handle opening section */}
                {content.scriptContent.opening && (
                  <div className="mb-4">
                    <h5 className="font-medium mb-1">Opening:</h5>
                    <p className="whitespace-pre-line">{content.scriptContent.opening}</p>
                  </div>
                )}
                
                {/* Handle main content sections */}
                {Array.isArray(content.scriptContent.mainContent) ? (
                  <div className="mb-4">
                    <h5 className="font-medium mb-1">Main Content:</h5>
                    {content.scriptContent.mainContent.map((section, index) => (
                      <div key={index} className="mb-3 pl-3 border-l-2 border-gray-200">
                        <h6 className="font-medium text-gray-700">{section.sectionTitle}</h6>
                        <p className="whitespace-pre-line mb-2">{section.script}</p>
                        {section.interactiveElement && (
                          <div className="bg-blue-50 p-2 rounded border border-blue-100">
                            <span className="text-xs font-medium text-blue-800">Interactive Element: </span>
                            <span className="text-xs text-blue-700">{section.interactiveElement}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : content.scriptContent.mainContent && typeof content.scriptContent.mainContent === 'string' ? (
                  <div className="mb-4">
                    <h5 className="font-medium mb-1">Main Content:</h5>
                    <p className="whitespace-pre-line">{content.scriptContent.mainContent}</p>
                  </div>
                ) : null}
                
                {/* Handle conclusion section */}
                {content.scriptContent.conclusion && (
                  <div>
                    <h5 className="font-medium mb-1">Conclusion:</h5>
                    <p className="whitespace-pre-line">{content.scriptContent.conclusion}</p>
                  </div>
                )}
              </div>
            )}
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
