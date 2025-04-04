import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentSchema } from "@shared/schema";
import { ZodError } from "zod";
// Import the AI modules from JS files
// @ts-ignore
import { generateEducationalContent as generateWithGroq } from "./groq";
// @ts-ignore
import { generateEducationalContent as generateWithGemini } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize API routes
  const apiRouter = express.Router();
  
  // Get all contents
  apiRouter.get("/contents", async (req: Request, res: Response) => {
    try {
      const contents = await storage.getAllContents();
      res.json(contents);
    } catch (error: any) {
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
    } catch (error: any) {
      res.status(500).json({ message: "Failed to retrieve content", error: error.message });
    }
  });
  
  // Create new content
  apiRouter.post("/contents", async (req: Request, res: Response) => {
    try {
      const contentData = insertContentSchema.parse(req.body);
      const newContent = await storage.createContent(contentData);
      res.status(201).json(newContent);
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete content", error: error.message });
    }
  });
  
  // Generate content with AI (GROQ or Gemini)
  apiRouter.post("/generate-content", async (req: Request, res: Response) => {
    try {
      const { 
        subject, 
        title, 
        ageGroup, 
        difficultyLevel, 
        contentFormat, 
        duration, 
        specificInstructions,
        aiModel = 'gemini' // Default to Gemini if not specified
      } = req.body;
      
      if (!subject || !title || !ageGroup || !difficultyLevel || !contentFormat || !duration) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Prepare content parameters
      const contentParams = {
        subject,
        title,
        ageGroup,
        difficultyLevel,
        contentFormat,
        duration,
        specificInstructions: specificInstructions || ""
      };
      
      // Generate content using the selected AI model
      let generatedContent;
      
      if (aiModel.toLowerCase() === 'gemini') {
        console.log('Generating content with Google Gemini...');
        generatedContent = await generateWithGemini(contentParams);
      } else {
        // Default to GROQ
        console.log('Generating content with GROQ...');
        generatedContent = await generateWithGroq(contentParams);
      }
      
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
        userId: 1,  // Default user for demo
        aiModel: aiModel.toLowerCase() // Store which AI model was used
      };
      
      const newContent = await storage.createContent(contentData);
      
      res.status(201).json(newContent);
    } catch (error: any) {
      console.error(`Error generating content: ${error.message}`);
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
