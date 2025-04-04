/**
 * Video Generator Service for TAP Educational Content
 * Converts AI-generated educational content into MP4 video files
 */

import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage, registerFont } from 'canvas';
import ffmpeg from 'fluent-ffmpeg';
import nodeHtmlToImage from 'node-html-to-image';
import { fileURLToPath } from 'url';

// Get current directory for file paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure directories exist
const TEMP_DIR = path.join(__dirname, '..', 'temp');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'videos');

// Create directories if they don't exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Create a video frame from content
 * @param {string} text - Text to display on frame
 * @param {number} frameNum - Frame number
 * @param {string} title - Content title
 * @param {string} subject - Subject area
 * @returns {Promise<string>} - Path to generated image
 */
async function createFrame(text, frameNum, title, subject) {
  const imagePath = path.join(TEMP_DIR, `frame_${frameNum.toString().padStart(5, '0')}.png`);
  
  // Get subject color
  const subjectColors = {
    'visual-arts': '#FF5722',
    'performing-arts': '#9C27B0',
    'coding': '#2196F3',
    'financial-literacy': '#4CAF50',
    'science': '#FFC107',
    'default': '#607D8B'
  };
  
  const color = subjectColors[subject] || subjectColors.default;
  
  // Create HTML content for the frame
  const html = `
    <html>
    <head>
      <style>
        body {
          width: 1280px;
          height: 720px;
          background-color: #1a1a2e;
          font-family: 'Arial', sans-serif;
          display: flex;
          flex-direction: column;
          padding: 40px;
          color: white;
          box-sizing: border-box;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .title {
          font-size: 36px;
          font-weight: bold;
          color: white;
        }
        .subject {
          font-size: 18px;
          padding: 8px 16px;
          border-radius: 20px;
          background-color: ${color};
          color: white;
        }
        .content {
          flex: 1;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 30px;
          font-size: 24px;
          line-height: 1.5;
          overflow: hidden;
        }
        .footer {
          margin-top: 20px;
          text-align: right;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.6);
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${title}</div>
        <div class="subject">${subject}</div>
      </div>
      <div class="content">${text}</div>
      <div class="footer">The Apprentice Project • Educational Content</div>
    </body>
    </html>
  `;
  
  // Generate image from HTML
  await nodeHtmlToImage({
    output: imagePath,
    html: html,
    transparent: false,
    puppeteerArgs: {
      defaultViewport: {
        width: 1280,
        height: 720
      }
    }
  });
  
  return imagePath;
}

/**
 * Generate a video from AI content
 * @param {Object} content - The AI-generated content
 * @returns {Promise<string>} - Path to the generated video
 */
export async function generateVideo(content) {
  try {
    console.log("Starting video generation process...");
    
    const { 
      title, 
      subject, 
      scriptContent, 
      id 
    } = content;
    
    // Determine output file path
    const timestamp = Date.now();
    const filename = `${subject}_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    
    // Extract script content for video frames
    let frames = [];
    
    // Handle different script content formats
    if (scriptContent.opening && scriptContent.mainContent && scriptContent.conclusion) {
      // Format 1: Opening, main content, conclusion
      frames.push({ text: scriptContent.opening, duration: 5 });
      
      if (Array.isArray(scriptContent.mainContent)) {
        scriptContent.mainContent.forEach(section => {
          frames.push({ 
            text: `<strong>${section.sectionTitle}</strong><br/><br/>${section.script}`, 
            duration: 8 
          });
          
          if (section.interactiveElement) {
            frames.push({ 
              text: `<strong>Interactive Element:</strong><br/><br/>${section.interactiveElement}`, 
              duration: 4 
            });
          }
        });
      }
      
      frames.push({ text: scriptContent.conclusion, duration: 5 });
    } else {
      // For any other format, just use the entire script
      const scriptText = typeof scriptContent === 'string' 
        ? scriptContent 
        : JSON.stringify(scriptContent, null, 2);
      
      // Split into paragraphs
      const paragraphs = scriptText.split('\\n\\n');
      for (const paragraph of paragraphs) {
        if (paragraph.trim()) {
          frames.push({ text: paragraph, duration: 5 });
        }
      }
    }
    
    console.log(`Generating ${frames.length} frames for video...`);
    
    // Generate all frames
    let frameFiles = [];
    for (let i = 0; i < frames.length; i++) {
      console.log(`Creating frame ${i + 1} of ${frames.length}`);
      const framePath = await createFrame(
        frames[i].text, 
        i, 
        title, 
        subject
      );
      frameFiles.push({ path: framePath, duration: frames[i].duration });
    }
    
    // Create video using ffmpeg
    console.log("Combining frames into video...");
    
    return new Promise((resolve, reject) => {
      let command = ffmpeg();
      
      // Add each frame to the video
      frameFiles.forEach(frame => {
        command = command.addInput(frame.path)
          .loop(frame.duration); // Duration in seconds
      });
      
      command
        .on('start', () => {
          console.log('Starting FFmpeg process');
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${progress.percent}% done`);
        })
        .on('end', () => {
          console.log('Video created successfully');
          
          // Clean up temporary files
          frameFiles.forEach(frame => {
            fs.unlinkSync(frame.path);
          });
          
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Error creating video:', err);
          reject(err);
        })
        .mergeToFile(outputPath, TEMP_DIR);
    });
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
}

/**
 * Get the URL for a video
 * @param {string} videoPath - Full path to video file
 * @returns {string} - URL for accessing the video
 */
export function getVideoUrl(videoPath) {
  const relativePath = path.relative(path.join(__dirname, '..', 'public'), videoPath);
  return `/${relativePath.replace(/\\/g, '/')}`;
}