import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, PlayCircle, AlertCircle } from "lucide-react";

/**
 * ContentVideo component to display generated videos
 * @param {Object} props
 * @param {Object} props.content - The content object with video URL
 */
const ContentVideo = ({ content }) => {
  // If there's no video URL or the content is in error state
  if (content.status === "error") {
    return (
      <Card className="mb-8 border-red-400 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Video Generation Error</h3>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {content.errorMessage || "There was an error generating the video for this content."}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              // Send a request to regenerate the video
              fetch(`/api/contents/${content.id}/generate-video`, {
                method: 'POST',
              })
                .then(res => res.json())
                .then(data => {
                  if (data.message) {
                    alert("Video generation started. The page will refresh in a moment.");
                    // Refresh the page after 2 seconds
                    setTimeout(() => window.location.reload(), 2000);
                  }
                })
                .catch(err => {
                  console.error("Error regenerating video:", err);
                  alert("Failed to start video generation. Please try again later.");
                });
            }}
          >
            Regenerate Video
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If the content is still processing
  if (content.status === "processing") {
    return (
      <Card className="mb-8 border-blue-400 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-4">
            <PlayCircle className="h-5 w-5 animate-pulse" />
            <h3 className="font-semibold">Video Generation in Progress</h3>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Your video is being generated. This may take a few moments. The page will automatically update when the video is ready.
          </p>
          {/* Auto-refresh the page every 10 seconds to check if video is ready */}
          <script dangerouslySetInnerHTML={{
            __html: `
              setTimeout(function() {
                window.location.reload();
              }, 10000);
            `
          }} />
        </CardContent>
      </Card>
    );
  }

  // If we have a video URL
  if (content.videoUrl) {
    return (
      <Card className="mb-8">
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2">Generated Video</h3>
          <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden mb-4">
            <video 
              controls
              className="w-full h-full"
              src={content.videoUrl}
              poster={`/api/contents/${content.id}/thumbnail`} // Optional, can be implemented later
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild className="flex items-center gap-1">
              <a href={content.videoUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If we don't have a video URL yet
  return (
    <Card className="mb-8">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <PlayCircle className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Video</h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          No video has been generated for this content yet.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            // Send a request to generate the video
            fetch(`/api/contents/${content.id}/generate-video`, {
              method: 'POST',
            })
              .then(res => res.json())
              .then(data => {
                if (data.message) {
                  alert("Video generation started. The page will refresh in a moment.");
                  // Refresh the page after 2 seconds
                  setTimeout(() => window.location.reload(), 2000);
                }
              })
              .catch(err => {
                console.error("Error generating video:", err);
                alert("Failed to start video generation. Please try again later.");
              });
          }}
        >
          Generate Video
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContentVideo;