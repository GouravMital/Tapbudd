/**
 * Video Generator Service for TAP Educational Content
 * Converts AI-generated educational content into MP4 video files using canvas
 */

import fs from 'fs';
import path from 'path';
import { createCanvas, registerFont } from 'canvas';
import ffmpeg from 'fluent-ffmpeg';
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

// Canvas dimensions
const WIDTH = 1280;
const HEIGHT = 720;

/**
 * Create a video frame from content using canvas
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
  
  // Create canvas
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // Draw header
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(title, 40, 80);
  
  // Draw subject badge
  ctx.fillStyle = color;
  ctx.beginPath();
  // Use arc for rounded rectangles since roundRect might not be available in all canvas implementations
  const drawRoundedRect = (x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  };
  
  drawRoundedRect(WIDTH - 200, 50, 160, 40, 20);
  ctx.fill();
  
  ctx.font = '18px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(subject, WIDTH - 120, 75);
  ctx.textAlign = 'left';
  
  // Draw content background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  drawRoundedRect(40, 120, WIDTH - 80, HEIGHT - 200, 16);
  ctx.fill();
  
  // Draw text content
  ctx.font = '24px Arial';
  ctx.fillStyle = '#FFFFFF';
  
  // Ensure text is a string and handle HTML safely
  const safeText = typeof text === 'string' ? text : String(text);
  const cleanText = safeText.replace(/<[^>]*>?/gm, '');
  
  // Simple text wrapping
  const words = cleanText.split(' ');
  let line = '';
  let y = 160;
  const lineHeight = 34;
  const maxWidth = WIDTH - 160;
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, 70, y);
      line = words[n] + ' ';
      y += lineHeight;
      
      // Check if we're going off the content area
      if (y > HEIGHT - 100) {
        ctx.fillText('...', 70, y);
        break;
      }
    } else {
      line = testLine;
    }
  }
  if (line != '') {
    ctx.fillText(line, 70, y);
  }
  
  // Draw footer
  ctx.font = '16px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.textAlign = 'right';
  ctx.fillText('The Apprentice Project • Educational Content', WIDTH - 40, HEIGHT - 40);
  
  // Save image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(imagePath, buffer);
  
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
    
    // Safely extract text from potentially complex objects
    const safeGetText = (obj) => {
      if (typeof obj === 'string') return obj;
      if (obj === null || obj === undefined) return '';
      if (typeof obj === 'object') {
        // For objects with a text or script property, prefer those
        if (obj.text) return typeof obj.text === 'string' ? obj.text : JSON.stringify(obj.text);
        if (obj.script) return typeof obj.script === 'string' ? obj.script : JSON.stringify(obj.script);
        // Otherwise stringify the whole object
        return JSON.stringify(obj, null, 2);
      }
      return String(obj); // Convert any other type to string
    };
    
    // Handle different script content formats
    if (scriptContent && typeof scriptContent === 'object') {
      // Check if it has opening, mainContent, conclusion structure
      if (scriptContent.opening || scriptContent.mainContent || scriptContent.conclusion) {
        // Format 1: Opening, main content, conclusion
        if (scriptContent.opening) {
          frames.push({ text: safeGetText(scriptContent.opening), duration: 5 });
        }
        
        if (scriptContent.mainContent) {
          if (Array.isArray(scriptContent.mainContent)) {
            scriptContent.mainContent.forEach(section => {
              // If section is an object with expected properties
              if (section && typeof section === 'object') {
                const sectionTitle = section.sectionTitle ? safeGetText(section.sectionTitle) : 'Section';
                const sectionContent = section.script ? safeGetText(section.script) : safeGetText(section);
                
                frames.push({ 
                  text: `<strong>${sectionTitle}</strong><br/><br/>${sectionContent}`, 
                  duration: 8 
                });
                
                if (section.interactiveElement) {
                  frames.push({ 
                    text: `<strong>Interactive Element:</strong><br/><br/>${safeGetText(section.interactiveElement)}`, 
                    duration: 4 
                  });
                }
              } else {
                // Section is a scalar value
                frames.push({ text: safeGetText(section), duration: 5 });
              }
            });
          } else {
            // MainContent is not an array
            frames.push({ text: safeGetText(scriptContent.mainContent), duration: 8 });
          }
        }
        
        if (scriptContent.conclusion) {
          frames.push({ text: safeGetText(scriptContent.conclusion), duration: 5 });
        }
      } else {
        // Object without the expected structure, convert to string
        frames.push({ text: JSON.stringify(scriptContent, null, 2), duration: 10 });
      }
    } else {
      // For any other format, just use the entire script
      const scriptText = typeof scriptContent === 'string' 
        ? scriptContent 
        : JSON.stringify(scriptContent, null, 2);
      
      // Split into paragraphs
      const paragraphs = scriptText.split(/\n\n|\\\n\\\n/);
      for (const paragraph of paragraphs) {
        if (paragraph.trim()) {
          frames.push({ text: paragraph, duration: 5 });
        }
      }
    }
    
    // Ensure we have at least one frame
    if (frames.length === 0) {
      frames.push({ 
        text: `No script content available for: ${title}`, 
        duration: 10 
      });
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
      try {
        // Create a concatenation file for ffmpeg
        const concatFilePath = path.join(TEMP_DIR, 'concat.txt');
        let concatContent = '';
        
        // Create content for concat file
        frameFiles.forEach(frame => {
          // For each frame, we need to specify the duration it should be shown
          for (let i = 0; i < frame.duration; i++) {
            concatContent += `file '${frame.path}'\nduration 1\n`;
          }
        });
        
        // Add the last file reference (required by ffmpeg concat)
        if (frameFiles.length > 0) {
          concatContent += `file '${frameFiles[frameFiles.length - 1].path}'`;
        }
        
        // Write the concat file
        fs.writeFileSync(concatFilePath, concatContent);
        
        console.log('Starting FFmpeg process');
        
        // Create the video with ffmpeg
        ffmpeg()
          .input(concatFilePath)
          .inputFormat('concat')
          .inputOptions(['-safe 0'])
          .videoCodec('libx264')
          .outputOptions(['-pix_fmt yuv420p']) // Required for compatibility
          .output(outputPath)
          .on('progress', (progress) => {
            console.log(`Processing: ${progress.percent ? progress.percent.toFixed(1) : 0}% done`);
          })
          .on('end', () => {
            console.log('Video created successfully');
            
            // Clean up temporary files
            frameFiles.forEach(frame => {
              try {
                fs.unlinkSync(frame.path);
              } catch (err) {
                console.log(`Could not delete frame: ${err.message}`);
              }
            });
            
            try {
              fs.unlinkSync(concatFilePath);
            } catch (err) {
              console.log(`Could not delete concat file: ${err.message}`);
            }
            
            resolve(outputPath);
          })
          .on('error', (err) => {
            console.error('Error creating video:', err);
            reject(err);
          })
          .run();
      } catch (err) {
        console.error('Error in ffmpeg setup:', err);
        reject(err);
      }
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