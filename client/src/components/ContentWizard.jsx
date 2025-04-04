import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import SubjectSelector from './SubjectSelector';

export default function ContentWizard() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    ageGroup: '',
    difficultyLevel: 'beginner',
    contentFormat: 'tutorial',
    duration: '5-8',
    specificInstructions: '',
    aiModel: 'groq' // Default to GROQ
  });

  const handleSubjectSelect = (subject) => {
    setFormData({
      ...formData,
      subject
    });
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const isFormValid = () => {
    console.log("Form validation check:", {
      subject: formData.subject,
      title: formData.title,
      ageGroup: formData.ageGroup,
      isValid: !!(formData.subject && formData.title && formData.ageGroup)
    });
    return !!(formData.subject && formData.title && formData.ageGroup);
  };

  const handleGenerateContent = async () => {
    console.log("Generate Content button clicked");
    if (!isFormValid()) {
      console.log("Form is not valid");
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    console.log("Proceeding with content generation", formData);
    setIsGenerating(true);
    try {
      console.log("Making API request to /api/generate-content");
      const response = await apiRequest('POST', '/api/generate-content', formData);
      console.log("API Response received:", response);
      const newContent = await response.json();
      
      // Invalidate queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/contents'] });
      
      toast({
        title: "Content generated successfully!",
        description: "Your content is now ready for review and export."
      });
      
      // Reset form
      setFormData({
        subject: '',
        title: '',
        ageGroup: '',
        difficultyLevel: 'beginner',
        contentFormat: 'tutorial',
        duration: '5-8',
        specificInstructions: '',
        aiModel: formData.aiModel // Keep the selected AI model
      });
      
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error.message || "An error occurred while generating content",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your content draft has been saved for later."
    });
  };

  const handleTestButtonClick = () => {
    console.log("Test button clicked");
    toast({
      title: "Test Button Works",
      description: "This button click is working correctly."
    });
  };

  return (
    <div className="p-5">
      <button 
        type="button" 
        onClick={handleTestButtonClick}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Test Button
      </button>

      <SubjectSelector 
        selectedSubject={formData.subject} 
        onSelectSubject={handleSubjectSelect} 
      />

      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-3">2. Set Content Parameters</h3>
        
        {/* AI Model Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="aiModel" 
                value="groq" 
                checked={formData.aiModel === 'groq'} 
                onChange={handleRadioChange}
                className="form-radio h-4 w-4 text-blue-600" 
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <i className="ri-robot-line mr-1 text-blue-500"></i> GROQ
              </span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="radio" 
                name="aiModel" 
                value="gemini" 
                checked={formData.aiModel === 'gemini'} 
                onChange={handleRadioChange}
                className="form-radio h-4 w-4 text-green-600" 
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <i className="ri-google-line mr-1 text-green-500"></i> Google Gemini
              </span>
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Topic/Lesson Title</label>
              <input 
                type="text" 
                id="title" 
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="E.g., Basic Color Theory, Intro to Python" 
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
              <select 
                id="ageGroup" 
                value={formData.ageGroup}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an age group</option>
                <option value="6-8">6-8 years</option>
                <option value="9-11">9-11 years</option>
                <option value="12-14">12-14 years</option>
                <option value="15-18">15-18 years</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
              <div className="flex space-x-3">
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="difficultyLevel" 
                    value="beginner" 
                    checked={formData.difficultyLevel === 'beginner'} 
                    onChange={handleRadioChange}
                    className="form-radio h-4 w-4 text-primary" 
                  />
                  <span className="ml-2 text-sm text-gray-700">Beginner</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="difficultyLevel" 
                    value="intermediate" 
                    checked={formData.difficultyLevel === 'intermediate'} 
                    onChange={handleRadioChange}
                    className="form-radio h-4 w-4 text-primary" 
                  />
                  <span className="ml-2 text-sm text-gray-700">Intermediate</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="difficultyLevel" 
                    value="advanced" 
                    checked={formData.difficultyLevel === 'advanced'}
                    onChange={handleRadioChange}
                    className="form-radio h-4 w-4 text-primary" 
                  />
                  <span className="ml-2 text-sm text-gray-700">Advanced</span>
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <label htmlFor="contentDuration" className="block text-sm font-medium text-gray-700 mb-1">Video Duration</label>
              <select 
                id="duration" 
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="3-5">3-5 minutes</option>
                <option value="5-8">5-8 minutes</option>
                <option value="8-12">8-12 minutes</option>
                <option value="12-15">12-15 minutes</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="contentFormat" className="block text-sm font-medium text-gray-700 mb-1">Content Format</label>
              <select 
                id="contentFormat" 
                value={formData.contentFormat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="tutorial">Tutorial</option>
                <option value="lesson">Lesson</option>
                <option value="demonstration">Demonstration</option>
                <option value="activity">Activity</option>
                <option value="quiz">Interactive Quiz</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="specificInstructions" className="block text-sm font-medium text-gray-700 mb-1">Specific Instructions (Optional)</label>
              <textarea 
                id="specificInstructions" 
                rows="3" 
                value={formData.specificInstructions}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Any specific requirements or objectives for this content..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button 
          type="button" 
          onClick={handleSaveDraft}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Save Draft
        </button>
        <button 
          type="button" 
          onClick={() => {
            console.log("Button clicked directly");
            handleGenerateContent();
          }}
          disabled={isGenerating || !isFormValid()}
          className={`px-4 py-2 bg-primary text-white rounded-md ${
            isGenerating || !isFormValid() ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
        >
          {isGenerating ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-1"></i> Generating...
            </>
          ) : (
            <>
              <i className="ri-magic-line mr-1"></i> Generate Content
            </>
          )}
        </button>
      </div>
    </div>
  );
}
