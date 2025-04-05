/**
 * Google Gemini AI integration for the TAP Educational Content Generator
 * Provides an alternative AI model for content generation
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the provided API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate educational content using Google Gemini AI
 * @param {Object} contentParams - Parameters for content generation
 * @returns {Object} Generated content
 */
async function generateEducationalContent(contentParams) {
  try {
    // Extract content parameters
    const {
      subject,
      title,
      ageGroup,
      difficultyLevel,
      contentFormat,
      duration,
      specificInstructions,
    } = contentParams;

    // Create a model instance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Construct the prompt
    const prompt = `
    You are an expert educational content creator for The Apprentice Project (TAP), an educational NGO that 
    provides engaging educational content for children. Create a detailed Video for a ${contentFormat} on ${title}.
    
    Content details:
    - Subject: ${subject}
    - Age Group: ${ageGroup}
    - Difficulty: ${difficultyLevel}
    - Duration: ${duration} minutes
    ${specificInstructions ? `- Special Instructions: ${specificInstructions}` : ""}
    
    Return a JSON response with the following structure:
    {
      "scriptContent": {
        "opening": "Opening script",
        "mainContent": [
          {
            "sectionTitle": "Section 1 Title",
            "script": "Detailed script for this section",
            "interactiveElement": "Suggestion for interactive element to engage learners"
          },
          ...more sections
        ],
        "conclusion": "Closing script"
      },
      "learningObjectives": ["objective 1", "objective 2", "objective 3"],
      "materials": ["material 1", "material 2", "material 3"],
      "visualReferences": [
        {
          "title": "Visual 1",
          "description": "Detailed description of visual aid"
        },
        ...more visuals
      ]
    }
    
    Make sure the content is engaging, age-appropriate, educational, and formatted exactly as requested.
    Do not include any preamble, instructions, or anything outside the JSON response.
    `;

    // Generate content from model
    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Extract and parse JSON response
    let textResponse = response.text();

    // Clean up response in case there are markdown code blocks
    if (textResponse.includes("```json")) {
      textResponse = textResponse.split("```json")[1].split("```")[0].trim();
    } else if (textResponse.includes("```")) {
      textResponse = textResponse.split("```")[1].split("```")[0].trim();
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(textResponse);
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      throw new Error("Failed to parse AI response");
    }

    // Return the generated content
    return {
      title,
      subject,
      ageGroup,
      difficultyLevel,
      contentFormat,
      duration,
      specificInstructions,
      scriptContent: parsedResponse.scriptContent,
      learningObjectives: parsedResponse.learningObjectives,
      materials: parsedResponse.materials,
      visualReferences: parsedResponse.visualReferences,
      status: "completed",
      userId: 1, // Default user ID
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
}

// Export as ES Module
export { generateEducationalContent };
