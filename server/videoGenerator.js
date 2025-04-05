/**
 * Video Generator Service for TAP Educational Content
 * Converts AI-generated educational content into MP4 video files using canvas
 */

import fs from 'fs';
import path from 'path';
import { createCanvas, registerFont, loadImage } from 'canvas';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';

// Get current directory for file paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Attempt to load fonts if available
try {
  // Try to register fonts for better typography
  // We'll skip this for now since we don't have the fonts downloaded
  // The code will use system fonts by default
  console.log('Using system fonts for video generation');
} catch (err) {
  console.log('Error loading fonts:', err.message);
}

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

// Subject-specific theme information
const SUBJECT_THEMES = {
  'visual-arts': {
    color: '#FF5722',
    gradient: ['#FF5722', '#FFA000'],
    icon: '🎨',
    background: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
    bgPattern: 'art'
  },
  'performing-arts': {
    color: '#9C27B0',
    gradient: ['#9C27B0', '#D500F9'],
    icon: '🎭',
    background: 'linear-gradient(135deg, #9C27B0 0%, #AA00FF 100%)',
    bgPattern: 'music'
  },
  'coding': {
    color: '#2196F3',
    gradient: ['#2196F3', '#03A9F4'],
    icon: '💻',
    background: 'linear-gradient(135deg, #2196F3 0%, #00BCD4 100%)',
    bgPattern: 'code'
  },
  'financial-literacy': {
    color: '#4CAF50',
    gradient: ['#4CAF50', '#8BC34A'],
    icon: '💰',
    background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
    bgPattern: 'finance'
  },
  'science': {
    color: '#FFC107',
    gradient: ['#FFC107', '#FFEB3B'],
    icon: '🔬',
    background: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)',
    bgPattern: 'science'
  },
  'default': {
    color: '#607D8B',
    gradient: ['#607D8B', '#90A4AE'],
    icon: '📚',
    background: 'linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)',
    bgPattern: 'default'
  }
};

/**
 * Helper to draw rounded rectangles
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
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
}

/**
 * Draw a gradient fill
 */
function drawGradient(ctx, x, y, width, height, colorStops) {
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  colorStops.forEach((color, index) => {
    gradient.addColorStop(index / (colorStops.length - 1), color);
  });
  return gradient;
}

/**
 * Draw a pattern background based on subject
 */
function drawSubjectPattern(ctx, subject, width, height) {
  const theme = SUBJECT_THEMES[subject] || SUBJECT_THEMES.default;
  const patternSize = 20;
  const color = theme.color;
  const secondaryColor = theme.gradient[1];
  
  // Draw basic gradient background
  ctx.fillStyle = drawGradient(ctx, 0, 0, width, height, [
    '#1a1a2e',
    '#16213e',
    '#0f3460',
    '#1a1a2e'
  ]);
  ctx.fillRect(0, 0, width, height);
  
  // Create decorative elements based on subject
  ctx.globalAlpha = 0.1;
  
  const drawDots = () => {
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 8 + 2;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? color : secondaryColor;
      ctx.fill();
    }
  };
  
  const drawLines = () => {
    for (let i = 0; i < 20; i++) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const x2 = x1 + (Math.random() - 0.5) * 200;
      const y2 = y1 + (Math.random() - 0.5) * 200;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = i % 2 === 0 ? color : secondaryColor;
      ctx.lineWidth = Math.random() * 3 + 1;
      ctx.stroke();
    }
  };
  
  const drawShapes = () => {
    for (let i = 0; i < 25; i++) {
      const size = Math.random() * 40 + 10;
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      ctx.beginPath();
      
      // Choose between different shapes
      if (i % 3 === 0) {
        // Circle
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
      } else if (i % 3 === 1) {
        // Square
        drawRoundedRect(ctx, x, y, size, size, 4);
      } else {
        // Triangle
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x - size, y + size);
        ctx.closePath();
      }
      
      ctx.fillStyle = i % 2 === 0 ? color : secondaryColor;
      ctx.fill();
    }
  };
  
  // Draw patterns based on subject
  switch (theme.bgPattern) {
    case 'art':
      drawShapes();
      break;
    case 'music':
      drawDots();
      drawLines();
      break;
    case 'code':
      // Code pattern
      for (let y = 0; y < height; y += 50) {
        const lineWidth = Math.random() * 100 + 50;
        ctx.fillStyle = color;
        ctx.fillRect(20, y, lineWidth, 5);
      }
      drawDots();
      break;
    case 'finance':
      // Finance pattern - graphs and charts symbols
      drawLines();
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.font = `${Math.random() * 30 + 20}px Arial`;
        ctx.fillStyle = color;
        ctx.fillText('$', x, y);
      }
      break;
    case 'science':
      // Science pattern - molecules and atoms
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 15 + 5;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Connect some dots to create molecule-like structures
        if (i > 0 && i % 3 === 0) {
          const prevX = Math.random() * width;
          const prevY = Math.random() * height;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(prevX, prevY);
          ctx.stroke();
        }
      }
      break;
    default:
      drawDots();
      drawLines();
  }
  
  ctx.globalAlpha = 1;
}

/**
 * Create a video frame from content using canvas
 * @param {string} text - Text to display on frame
 * @param {number} frameNum - Frame number
 * @param {string} title - Content title
 * @param {string} subject - Subject area
 * @param {Object} options - Additional frame options
 * @param {string} options.type - Frame type (opening, section, interactive, conclusion, etc.)
 * @param {boolean} options.animate - Whether to apply animation effects
 * @param {number} options.totalFrames - Total number of frames in the video
 * @param {Object} options.frameData - Additional data about the frame
 * @returns {Promise<string>} - Path to generated image
 */
async function createFrame(text, frameNum, title, subject, options = {}) {
  const imagePath = path.join(TEMP_DIR, `frame_${frameNum.toString().padStart(5, '0')}.png`);
  
  // Determine subject theme
  const subjectKey = subject.toLowerCase().replace(/\s+/g, '-');
  const theme = SUBJECT_THEMES[subjectKey] || SUBJECT_THEMES.default;
  
  // Create canvas
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // Determine the frame type for specialized styling
  const frameType = options.type || 'standard';
  
  // Draw themed background with variations based on frame type
  if (frameType === 'opening') {
    // Opening/title slide has a more dramatic background
    ctx.fillStyle = drawGradient(ctx, 0, 0, WIDTH, HEIGHT, [
      '#0f172a',  // Dark blue
      '#1e293b',  // Slate
      theme.color + '30'  // Theme color with transparency
    ]);
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Add decorative elements
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 15; i++) {
      const size = Math.random() * 100 + 50;
      const x = Math.random() * WIDTH;
      const y = Math.random() * HEIGHT;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? theme.color : theme.gradient[1];
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
  } else if (frameType === 'conclusion') {
    // Conclusion has a different background style
    ctx.fillStyle = drawGradient(ctx, 0, 0, WIDTH, HEIGHT, [
      '#0f172a',
      theme.color + '20',
      '#0f172a'
    ]);
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Add subtle border effect
    const borderWidth = 10;
    ctx.strokeStyle = theme.color + '50';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(borderWidth/2, borderWidth/2, WIDTH - borderWidth, HEIGHT - borderWidth);
    
  } else if (frameType === 'interactive') {
    // Interactive elements get a more engaging background
    drawSubjectPattern(ctx, subjectKey, WIDTH, HEIGHT);
    
    // Add interactive element styling
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 8; i++) {
      const y = 100 + i * 70;
      ctx.fillStyle = i % 2 === 0 ? theme.color : theme.gradient[1];
      ctx.fillRect(0, y, WIDTH, 3);
    }
    ctx.globalAlpha = 1;
    
  } else {
    // Standard frames use the regular subject pattern
    drawSubjectPattern(ctx, subjectKey, WIDTH, HEIGHT);
  }
  
  // Draw a semi-transparent overlay for better text contrast
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // Draw content container with gradient border
  const contentX = 40;
  const contentY = 120;
  const contentWidth = WIDTH - 80;
  const contentHeight = HEIGHT - 190;
  
  // Draw gradient border
  ctx.fillStyle = drawGradient(ctx, contentX, contentY, contentWidth, contentHeight, theme.gradient);
  drawRoundedRect(ctx, contentX, contentY, contentWidth, contentHeight, 16);
  ctx.fill();
  
  // Draw inner content area
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  drawRoundedRect(ctx, contentX + 3, contentY + 3, contentWidth - 6, contentHeight - 6, 13);
  ctx.fill();
  
  // Draw decorative header accent
  ctx.fillStyle = theme.color;
  ctx.fillRect(40, 50, 10, 40);
  
  // Draw title with shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.font = 'bold 36px Poppins, Arial';
  
  // Create gradient for title
  const titleGradient = ctx.createLinearGradient(60, 50, WIDTH / 2, 50);
  titleGradient.addColorStop(0, '#ffffff');
  titleGradient.addColorStop(1, '#e0e0e0');
  ctx.fillStyle = titleGradient;
  
  ctx.fillText(title, 60, 80);
  ctx.restore();
  
  // Draw subject pill
  const subjectWidth = Math.min(theme.icon.length * 30 + subject.length * 9 + 40, 180);
  ctx.fillStyle = drawGradient(ctx, WIDTH - subjectWidth - 40, 50, subjectWidth, 40, theme.gradient);
  drawRoundedRect(ctx, WIDTH - subjectWidth - 40, 50, subjectWidth, 40, 20);
  ctx.fill();
  
  // Add slight inner shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  
  // Draw subject icon and text
  ctx.font = '18px Poppins, Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(`${theme.icon} ${subject}`, WIDTH - subjectWidth / 2 - 40, 77);
  ctx.textAlign = 'left';
  ctx.restore();
  
  // Draw frame number indicator
  ctx.font = '14px Poppins, Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.textAlign = 'left';
  ctx.fillText(`Frame ${frameNum + 1}`, 70, HEIGHT - 50);
  
  // Process text content - detect if it has structure
  const safeText = typeof text === 'string' ? text : String(text);
  const isTextWithHeading = safeText.match(/<strong>(.*?)<\/strong>/i);
  
  // Extract heading and content if present
  let heading = null;
  let content = safeText;
  
  if (isTextWithHeading) {
    const matches = safeText.match(/<strong>(.*?)<\/strong>(.*)/is);
    if (matches && matches.length > 2) {
      heading = matches[1].trim();
      content = matches[2].replace(/<br\/?>/gi, ' ').trim();
    }
  }
  
  // Clean text of HTML tags
  const cleanContent = content.replace(/<[^>]*>?/gm, '');
  
  // Draw section heading if present
  let textY = 160;
  
  // Special layout based on frame type
  if (frameType === 'interactive') {
    // Interactive element gets a special treatment
    ctx.save();
    
    // Draw decorative elements to emphasize interactive nature
    const interactiveBoxY = textY - 40;
    const interactiveBoxHeight = 50;
    
    // Draw eye-catching background for "Interactive Element" 
    ctx.fillStyle = drawGradient(ctx, 50, interactiveBoxY, WIDTH - 100, interactiveBoxHeight, [
      theme.color, 
      theme.gradient[1]
    ]);
    drawRoundedRect(ctx, 50, interactiveBoxY, WIDTH - 100, interactiveBoxHeight, 8);
    ctx.fill();
    
    // Draw emoji and text
    ctx.font = '32px Poppins, Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('✋ Interactive Activity', 100, interactiveBoxY + 35);
    
    // Add a subtle pointing effect
    ctx.beginPath();
    ctx.moveTo(85, interactiveBoxY + 33);
    ctx.lineTo(70, interactiveBoxY + 55);
    ctx.lineTo(70, interactiveBoxY + 25);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    // Continue with adjusted Y position
    textY += 30;
    ctx.restore();
  } else if (frameType === 'opening') {
    // Title frame gets a more prominent heading style
    ctx.save();
    
    // Draw large decorative quotation mark or icon
    ctx.font = '60px Poppins, Arial';
    ctx.fillStyle = theme.color + '90';
    ctx.fillText('🔍', 70, textY - 40);
    
    // Draw "Introduction" label
    ctx.font = 'bold 32px Poppins, Arial';
    ctx.fillStyle = theme.color;
    ctx.fillText('Introduction', 150, textY - 40);
    
    // Set up for the main content
    ctx.font = '26px Poppins, Arial';
    ctx.fillStyle = '#FFFFFF';
    textY += 20;
    
    ctx.restore();
  } else if (frameType === 'conclusion') {
    // Conclusion gets a special style
    ctx.save();
    
    // Draw decorative element
    ctx.font = '60px Poppins, Arial';
    ctx.fillStyle = theme.color + '90';
    ctx.fillText('💡', 70, textY - 40);
    
    // Draw "Conclusion" label
    ctx.font = 'bold 32px Poppins, Arial';
    ctx.fillStyle = theme.color;
    ctx.fillText('Conclusion', 150, textY - 40);
    
    // Set up for the main content
    ctx.font = '26px Poppins, Arial';
    ctx.fillStyle = '#FFFFFF';
    textY += 20;
    
    ctx.restore();
  } else if (heading) {
    // For regular section frames with headings
    ctx.font = 'bold 28px Poppins, Arial';
    ctx.fillStyle = theme.color;
    ctx.fillText(heading, 70, textY);
    textY += 45;
  }
  
  // Draw text content with improved wrapping
  ctx.font = '24px Poppins, Arial';
  ctx.fillStyle = '#FFFFFF';
  
  const words = cleanContent.split(' ');
  let line = '';
  const lineHeight = 34;
  const maxWidth = WIDTH - 160;
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, 70, textY);
      line = words[n] + ' ';
      textY += lineHeight;
      
      // Check if we're going off the content area
      if (textY > HEIGHT - 100) {
        ctx.fillText('...', 70, textY);
        break;
      }
    } else {
      line = testLine;
    }
  }
  if (line != '') {
    ctx.fillText(line, 70, textY);
  }
  
  // Draw progress bar
  if (frameNum >= 0) {
    const progressBar = {
      x: WIDTH - 260,
      y: HEIGHT - 50,
      width: 200,
      height: 6,
      cornerRadius: 3,
      progress: 0 // Will be calculated
    };
    
    // Get progress from frame number (assuming it's passed in order)
    const totalFrames = options.totalFrames || 10; // Use passed total frames or default to 10
    progressBar.progress = Math.min(1, (frameNum + 1) / totalFrames);
    
    // Draw background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    drawRoundedRect(ctx, progressBar.x, progressBar.y, progressBar.width, progressBar.height, progressBar.cornerRadius);
    ctx.fill();
    
    // Draw progress
    ctx.fillStyle = drawGradient(
      ctx, 
      progressBar.x, 
      progressBar.y, 
      progressBar.width * progressBar.progress, 
      progressBar.height, 
      theme.gradient
    );
    
    // Draw progress bar with rounded corners
    drawRoundedRect(
      ctx, 
      progressBar.x, 
      progressBar.y, 
      progressBar.width * progressBar.progress, 
      progressBar.height, 
      progressBar.cornerRadius
    );
    ctx.fill();
  }
  
  // Draw footer
  ctx.font = '16px Poppins, Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
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
          // Title frame with intro content
          frames.push({
            type: 'opening',
            text: safeGetText(scriptContent.opening),
            duration: 6, // Slightly longer for introduction
            animate: true
          });
        }
        
        if (scriptContent.mainContent) {
          if (Array.isArray(scriptContent.mainContent)) {
            scriptContent.mainContent.forEach((section, index) => {
              // If section is an object with expected properties
              if (section && typeof section === 'object') {
                const sectionTitle = section.sectionTitle ? safeGetText(section.sectionTitle) : `Section ${index + 1}`;
                const sectionContent = section.script ? safeGetText(section.script) : safeGetText(section);
                
                // Calculate duration based on content length - longer content gets more time
                const contentLength = sectionContent.length;
                const baseDuration = 7;
                const extraDuration = Math.min(5, Math.floor(contentLength / 150)); // Add up to 5 seconds for long content
                
                frames.push({
                  type: 'section',
                  text: `<strong>${sectionTitle}</strong><br/><br/>${sectionContent}`,
                  sectionTitle: sectionTitle,
                  duration: baseDuration + extraDuration,
                  animate: true,
                  index: index
                });
                
                if (section.interactiveElement) {
                  frames.push({
                    type: 'interactive',
                    text: `<strong>Interactive Element:</strong><br/><br/>${safeGetText(section.interactiveElement)}`,
                    duration: 5,
                    animate: true
                  });
                }
              } else {
                // Section is a scalar value
                frames.push({
                  type: 'simple',
                  text: safeGetText(section),
                  duration: 5,
                  animate: true
                });
              }
            });
          } else {
            // MainContent is not an array
            const content = safeGetText(scriptContent.mainContent);
            // Calculate duration based on content length
            const contentLength = content.length;
            const baseDuration = 7;
            const extraDuration = Math.min(5, Math.floor(contentLength / 200));
            
            frames.push({
              type: 'content',
              text: content,
              duration: baseDuration + extraDuration,
              animate: true
            });
          }
        }
        
        if (scriptContent.conclusion) {
          frames.push({
            type: 'conclusion',
            text: safeGetText(scriptContent.conclusion),
            duration: 6, // Slightly longer for conclusion
            animate: true
          });
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
    
    // Set the total number of frames for progress bar calculation
    const totalFrames = frames.length;
    console.log(`Preparing to generate ${totalFrames} frames for video...`);
    
    // Generate all frames
    let frameFiles = [];
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      console.log(`Creating frame ${i + 1} of ${frames.length}: ${frame.type || 'standard'}`);
      
      // Pass frame type and index information to createFrame
      const framePath = await createFrame(
        frame.text, 
        i, 
        title, 
        subject,
        {
          type: frame.type || 'standard',
          animate: frame.animate || false,
          totalFrames: totalFrames,
          frameData: frame // Pass all frame data for additional customization
        }
      );
      
      frameFiles.push({ path: framePath, duration: frame.duration });
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
          .outputOptions([
            '-pix_fmt yuv420p', // Required for compatibility
            '-preset medium', // Balance between quality and encoding speed
            '-crf 22', // Constant Rate Factor - lower is better quality (18-28 is good range)
            '-movflags +faststart', // Allows video to start playing before fully downloaded
            '-vf scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:-1:-1:color=black' // Ensure consistent dimensions
          ])
          // Adding metadata as a separate option
          .addOutputOption('-metadata:s:v', 'title=TAP Educational Content')
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