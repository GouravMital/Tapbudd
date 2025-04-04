import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentSchema } from "@shared/schema";
import { ZodError } from "zod";
import OpenAI from "openai";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "your-api-key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize API routes
  const apiRouter = express.Router();
  
  // Get all contents
  apiRouter.get("/contents", async (req: Request, res: Response) => {
    try {
      const contents = await storage.getAllContents();
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve contents", error: error.message });
    }
  });
  
  // Get content by ID
  apiRouter.get("/contents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.getContent(id);
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve content", error: error.message });
    }
  });
  
  // Create new content
  apiRouter.post("/contents", async (req: Request, res: Response) => {
    try {
      const contentData = insertContentSchema.parse(req.body);
      const newContent = await storage.createContent(contentData);
      res.status(201).json(newContent);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid content data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create content", error: error.message });
      }
    }
  });
  
  // Update content
  apiRouter.patch("/contents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const contentData = req.body;
      
      const updatedContent = await storage.updateContent(id, contentData);
      
      if (!updatedContent) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json(updatedContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update content", error: error.message });
    }
  });
  
  // Delete content
  apiRouter.delete("/contents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteContent(id);
      
      if (!result) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete content", error: error.message });
    }
  });
  
  // Generate content with AI
  apiRouter.post("/generate-content", async (req: Request, res: Response) => {
    try {
      const { subject, title, ageGroup, difficultyLevel, contentFormat, duration, specificInstructions } = req.body;
      
      if (!subject || !title || !ageGroup || !difficultyLevel || !contentFormat || !duration) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Create the prompt for generating educational content
      const prompt = `
        Generate an educational video script for ${title} in the subject area of ${subject}.
        
        Details:
        - Age Group: ${ageGroup}
        - Difficulty Level: ${difficultyLevel}
        - Content Format: ${contentFormat}
        - Duration: ${duration}
        - Specific Instructions: ${specificInstructions || "None"}
        
        Please provide the output in the following JSON format:
        {
          "scriptContent": "Full script with sections and timestamps",
          "learningObjectives": ["objective1", "objective2", ...],
          "materials": ["material1", "material2", ...],
          "visualReferences": [
            {"title": "reference1", "description": "description1"},
            {"title": "reference2", "description": "description2"},
            ...
          ]
        }
      `;
      
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert educational content creator specializing in creating engaging video scripts for children and young adults." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse the generated content
      const generatedContent = JSON.parse(response.choices[0].message.content);
      
      // Create the content in storage
      const contentData = {
        title,
        subject,
        ageGroup,
        difficultyLevel,
        contentFormat,
        duration,
        specificInstructions: specificInstructions || "",
        status: "completed",
        scriptContent: generatedContent.scriptContent,
        learningObjectives: generatedContent.learningObjectives,
        materials: generatedContent.materials,
        visualReferences: generatedContent.visualReferences,
        userId: 1  // Default user for demo
      };
      
      const newContent = await storage.createContent(contentData);
      
      res.status(201).json(newContent);
    } catch (error) {
      console.error('Error generating content:', error);
      res.status(500).json({ 
        message: "Failed to generate content", 
        error: error.message 
      });
    }
  });
  
  // Mount the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
