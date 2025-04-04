import { Groq } from "groq-sdk";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate educational content using GROQ AI
 * @param {Object} contentParams - Parameters for content generation
 * @returns {Object} Generated content
 */
async function generateEducationalContent(contentParams) {
  try {
    const { 
      subject, 
      title, 
      ageGroup, 
      difficultyLevel, 
      contentFormat, 
      duration, 
      specificInstructions 
    } = contentParams;

    // Construct a detailed prompt
    const prompt = `
    Create educational video content for children on ${subject} about "${title}".
    
    Details:
    - Age Group: ${ageGroup} years
    - Difficulty Level: ${difficultyLevel}
    - Content Format: ${contentFormat}
    - Duration: ${duration} minutes
    ${specificInstructions ? `- Specific Instructions: ${specificInstructions}` : ''}
    
    Please structure your response as a JSON object with the following fields:
    1. title: The title of the educational content
    2. subject: The subject area (${subject})
    3. ageGroup: The target age group (${ageGroup})
    4. difficultyLevel: The difficulty level (${difficultyLevel})
    5. contentFormat: The format of the content (${contentFormat})
    6. duration: The estimated duration (${duration})
    7. scriptContent: The complete video script including opening, main content, and conclusion
    8. learningObjectives: An array of 3-5 key learning objectives
    9. materials: An array of any materials or tools needed
    10. visualReferences: An array of suggested visual references for the video (3-5 items), each with a title and description
    11. teacherNotes: Additional notes for the teacher or presenter

    The script should be engaging, educational, and appropriate for the age group. Include interactive elements where appropriate.
    `;

    // Call the GROQ API using the Llama 3 model for creative long-form content
    const chatCompletion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator for children. Create high-quality, engaging, and age-appropriate content for educational videos. Your content should be factually correct, engaging, and formatted according to the requested parameters."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    // Parse the response
    const responseContent = JSON.parse(chatCompletion.choices[0].message.content);
    
    // Add metadata
    const content = {
      ...responseContent,
      createdAt: new Date().toISOString(),
      status: 'completed',
    };

    return content;
  } catch (error) {
    console.error("Error generating content with GROQ:", error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

export { generateEducationalContent };