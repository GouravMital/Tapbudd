// Functions to interact with OpenAI API via our backend

export const generateContent = async (contentParams) => {
  try {
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contentParams),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate content');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

export const regenerateContent = async (contentId, newParams) => {
  try {
    // First get the existing content
    const getResponse = await fetch(`/api/contents/${contentId}`);
    
    if (!getResponse.ok) {
      const errorData = await getResponse.json();
      throw new Error(errorData.message || 'Failed to retrieve content');
    }
    
    const existingContent = await getResponse.json();
    
    // Merge existing and new params
    const contentParams = {
      ...existingContent,
      ...newParams,
    };
    
    // Generate new content
    return await generateContent(contentParams);
  } catch (error) {
    console.error('Error regenerating content:', error);
    throw error;
  }
};
