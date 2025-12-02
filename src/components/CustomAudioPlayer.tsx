import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Progress } from "./ui/progress";

interface CustomAudioPlayerProps {
  src: string;
  duration: number;
}

const CustomAudioPlayer = ({ src, duration }: CustomAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * duration;
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (currentTime / duration) * 100;

  return (
    <div className="space-y-3">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="bg-gradient-primary hover:opacity-90 transition-opacity p-3 rounded-full shadow-lg flex-shrink-0"
        >
          {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
        </button>

        <div className="flex-1 space-y-2">
          <div onClick={handleProgressClick} className="cursor-pointer">
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
