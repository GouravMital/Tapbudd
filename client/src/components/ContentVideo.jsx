import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

export default function ContentVideo({ content }) {
  const { toast } = useToast();
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  
  // Return early if no content is provided
  if (!content) return null;
  
  // Reset video states when content changes
  useEffect(() => {
    if (content && content.videoUrl) {
      setIsVideoLoading(true);
      setVideoError(false);
    }
  }, [content?.id, content?.videoUrl]);
  
  // Function to generate video
  const handleGenerateVideo = async () => {
    if (!content.id) return;
    
    try {
      toast({
        title: "Starting video generation",
        description: "This may take a minute or two to complete"
      });
      
      await apiRequest(`/api/contents/${content.id}/generate-video`, {
        method: 'POST'
      });
      
      // Invalidate content query to fetch updated status
      queryClient.invalidateQueries({ queryKey: ['/api/contents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/contents', content.id] });
    } catch (error) {
      console.error('Error generating video:', error);
      toast({
        title: "Video generation failed",
        description: error.message || "There was an error generating the video",
        variant: "destructive"
      });
    }
  };

  // Status based styling and content
  const getStatusDisplay = () => {
    switch (content.status) {
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
            <h4 className="font-medium text-gray-700">Generating Video</h4>
            <p className="text-sm text-gray-500">Please wait, this may take a minute...</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center bg-red-50 rounded-lg p-6 mb-4 border border-red-200">
            <div className="rounded-full h-8 w-8 bg-red-100 flex items-center justify-center mb-2">
              <i className="ri-error-warning-line text-red-500"></i>
            </div>
            <h4 className="font-medium text-red-700">Video Generation Failed</h4>
            <p className="text-sm text-red-500">{content.errorMessage || 'An error occurred during video generation'}</p>
            <button 
              className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
              onClick={handleGenerateVideo}
            >
              <i className="ri-refresh-line mr-1"></i>Retry
            </button>
          </div>
        );
      case 'completed':
        if (content.videoUrl) {
          return (
            <div className="bg-gray-50 rounded-lg overflow-hidden mb-4">
              <h4 className="font-medium text-gray-700 p-3 bg-gray-100">Educational Video</h4>
              <div className="aspect-video relative">
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    <span className="ml-2 text-gray-600">Loading video...</span>
                  </div>
                )}
                {videoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10">
                    <div className="rounded-full h-10 w-10 bg-red-100 flex items-center justify-center mb-2">
                      <i className="ri-error-warning-line text-red-500 text-xl"></i>
                    </div>
                    <p className="text-red-600">Failed to load video</p>
                    <button 
                      className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.load();
                          setIsVideoLoading(true);
                          setVideoError(false);
                        }
                      }}
                    >
                      <i className="ri-refresh-line mr-1"></i>Retry
                    </button>
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  src={content.videoUrl}
                  poster="/placeholder-video-poster.svg"
                  onLoadedData={() => setIsVideoLoading(false)}
                  onError={() => {
                    setIsVideoLoading(false);
                    setVideoError(true);
                    console.error('Error loading video:', content.videoUrl);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="p-3 flex justify-between items-center bg-gray-100">
                <span className="text-sm text-gray-500">Video for: {content.title}</span>
                <a 
                  href={content.videoUrl}
                  download={`${content.title.replace(/\s+/g, '-')}.mp4`}
                  className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                >
                  <i className="ri-download-line mr-1"></i>Download
                </a>
              </div>
            </div>
          );
        }
        return null;
      default:
        if (content.videoUrl) {
          // If there's a video URL but no explicit status, show the video
          return (
            <div className="bg-gray-50 rounded-lg overflow-hidden mb-4">
              <h4 className="font-medium text-gray-700 p-3 bg-gray-100">Educational Video</h4>
              <div className="aspect-video relative">
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    <span className="ml-2 text-gray-600">Loading video...</span>
                  </div>
                )}
                {videoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10">
                    <div className="rounded-full h-10 w-10 bg-red-100 flex items-center justify-center mb-2">
                      <i className="ri-error-warning-line text-red-500 text-xl"></i>
                    </div>
                    <p className="text-red-600">Failed to load video</p>
                    <button 
                      className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.load();
                          setIsVideoLoading(true);
                          setVideoError(false);
                        }
                      }}
                    >
                      <i className="ri-refresh-line mr-1"></i>Retry
                    </button>
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="w-full h-full"
                  controls
                  src={content.videoUrl}
                  poster="/placeholder-video-poster.svg"
                  onLoadedData={() => setIsVideoLoading(false)}
                  onError={() => {
                    setIsVideoLoading(false);
                    setVideoError(true);
                    console.error('Error loading video:', content.videoUrl);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="p-3 flex justify-between items-center bg-gray-100">
                <span className="text-sm text-gray-500">Video for: {content.title}</span>
                <a 
                  href={content.videoUrl}
                  download={`${content.title.replace(/\s+/g, '-')}.mp4`}
                  className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                >
                  <i className="ri-download-line mr-1"></i>Download
                </a>
              </div>
            </div>
          );
        }
        
        // No video available yet
        return (
          <div className="flex flex-col items-center justify-center bg-blue-50 rounded-lg p-6 mb-4">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              onClick={handleGenerateVideo}
            >
              <i className="ri-video-add-line mr-2"></i>
              Generate Video
            </button>
            <p className="text-sm text-blue-600 mt-2">Generate a video from this content</p>
          </div>
        );
    }
  };

  return (
    <div className="mb-4">
      {getStatusDisplay()}
    </div>
  );
}