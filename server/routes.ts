import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentSchema } from "@shared/schema";
import { ZodError } from "zod";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get current directory since __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the AI modules from JS files
// @ts-ignore
import { generateEducationalContent as generateWithGroq } from "./groq";
// @ts-ignore
import { generateEducationalContent as generateWithGemini } from "./gemini";
// @ts-ignore
import { generateVideo, getVideoUrl } from "./videoGenerator";

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
        status: "processing", // Set to processing while video is being generated
        scriptContent: generatedContent.scriptContent,
        learningObjectives: generatedContent.learningObjectives,
        materials: generatedContent.materials,
        visualReferences: generatedContent.visualReferences,
        userId: 1,  // Default user for demo
        aiModel: aiModel.toLowerCase() // Store which AI model was used
      };
      
      // Create content entry first
      const newContent = await storage.createContent(contentData);
      
      // Send immediate response with the created content
      res.status(201).json(newContent);
      
      try {
        console.log("Starting video generation process...");
        
        // Start generating video in the background
        // Generate video from the content (this may take some time)
        const videoPath = await generateVideo(newContent);
        const videoUrl = getVideoUrl(videoPath);
        
        console.log(`Video generated successfully at: ${videoPath}`);
        console.log(`Video URL: ${videoUrl}`);
        
        // Update the content with the video URL and status
        await storage.updateContent(newContent.id, {
          status: "completed",
          videoUrl: videoUrl
        });
        
        console.log(`Content ${newContent.id} updated with video URL`);
      } catch (videoError: any) {
        console.error("Error generating video:", videoError);
        
        // Update content status to reflect the error
        await storage.updateContent(newContent.id, {
          status: "error",
          errorMessage: videoError.message || "Unknown error during video generation"
        });
      }
    } catch (error: any) {
      console.error(`Error generating content: ${error.message}`);
      res.status(500).json({ 
        message: "Failed to generate content", 
        error: error.message 
      });
    }
  });
  
  // Add a route to serve video files with range support and caching
  apiRouter.get("/videos/:filename", (req: Request, res: Response) => {
    const filename = req.params.filename;
    const videoPath = path.join(__dirname, '..', 'public', 'videos', filename);
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours caching
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Get file stats
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    // Support for range requests (important for video seeking)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      console.log(`Serving video range request: ${start}-${end}/${fileSize}`);
      
      const file = fs.createReadStream(videoPath, { start, end });
      
      res.status(206); // Partial Content
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunksize);
      
      file.pipe(res);
    } else {
      // Send the full file if no range is requested
      console.log(`Serving full video file: ${filename}, size: ${fileSize} bytes`);
      
      res.setHeader('Content-Length', fileSize);
      fs.createReadStream(videoPath).pipe(res);
    }
  });
  
  // Route to generate video for existing content
  apiRouter.post("/contents/:id/generate-video", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.getContent(id);
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // Update status to processing
      await storage.updateContent(id, { status: "processing" });
      
      // Send immediate response
      res.json({ 
        message: "Video generation started", 
        contentId: id 
      });
      
      try {
        // Generate video
        const videoPath = await generateVideo(content);
        const videoUrl = getVideoUrl(videoPath);
        
        // Update content with video URL
        await storage.updateContent(id, {
          status: "completed",
          videoUrl: videoUrl
        });
      } catch (error: any) {
        console.error(`Error generating video for content ${id}:`, error);
        await storage.updateContent(id, {
          status: "error",
          errorMessage: error.message || "Unknown error during video generation"
        });
      }
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to generate video", 
        error: error.message 
      });
    }
  });
  
  // Mount the API router
  app.use("/api", apiRouter);
  
  // Serve static video files
  app.use('/videos', express.static(path.join(__dirname, '..', 'public', 'videos')));

  const httpServer = createServer(app);
  return httpServer;
}
