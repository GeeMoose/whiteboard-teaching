import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { Animation, AnimationStatus } from '../types/api';
import ApiService from '../services/api';

const PlayerContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const VideoContainer = styled.div`
  position: relative;
  background: #000;
  aspect-ratio: 16/9;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.125rem;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
`;

const PlayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ProgressContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.input`
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #3b82f6;
    border-radius: 50%;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #3b82f6;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const TimeDisplay = styled.span`
  color: #64748b;
  font-size: 0.875rem;
  font-family: monospace;
  min-width: 80px;
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  color: #64748b;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e2e8f0;
    color: #374151;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const AnimationInfo = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #1e293b;
    font-size: 1.125rem;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: #64748b;
    font-size: 0.875rem;
  }
`;

interface AnimationPlayerProps {
  animation: Animation;
  autoPlay?: boolean;
}

const AnimationPlayer: React.FC<AnimationPlayerProps> = ({ 
  animation, 
  autoPlay = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  useEffect(() => {
    if (animation.status === AnimationStatus.COMPLETED) {
      setVideoUrl(ApiService.getAnimationFileUrl(animation.id));
      setThumbnailUrl(ApiService.getAnimationThumbnailUrl(animation.id));
    }
  }, [animation]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = () => {
    switch (animation.status) {
      case AnimationStatus.PENDING:
        return 'Animation queued for generation...';
      case AnimationStatus.GENERATING:
        return 'Generating animation...';
      case AnimationStatus.FAILED:
        return 'Animation generation failed';
      default:
        return 'Loading...';
    }
  };

  return (
    <PlayerContainer>
      <AnimationInfo>
        <h3>{animation.title}</h3>
        {animation.description && <p>{animation.description}</p>}
      </AnimationInfo>
      
      <VideoContainer>
        {animation.status === AnimationStatus.COMPLETED ? (
          <Video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnailUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            autoPlay={autoPlay}
            muted={isMuted}
          />
        ) : (
          <>
            {thumbnailUrl && <Thumbnail src={thumbnailUrl} alt="Animation thumbnail" />}
            <LoadingOverlay>
              {getStatusMessage()}
            </LoadingOverlay>
          </>
        )}
      </VideoContainer>
      
      {animation.status === AnimationStatus.COMPLETED && (
        <Controls>
          <PlayButton onClick={togglePlay} disabled={!videoUrl}>
            {isPlaying ? <Pause /> : <Play />}
          </PlayButton>
          
          <ProgressContainer>
            <ProgressBar
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleProgressChange}
            />
            <TimeDisplay>
              {formatTime(currentTime)} / {formatTime(duration)}
            </TimeDisplay>
          </ProgressContainer>
          
          <ControlButton onClick={resetVideo} title="Restart">
            <RotateCcw />
          </ControlButton>
          
          <ControlButton onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <VolumeX /> : <Volume2 />}
          </ControlButton>
        </Controls>
      )}
    </PlayerContainer>
  );
};

export default AnimationPlayer;