import { Play, Pause, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Slider } from "./ui/slider";

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([80]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-glow">
      <audio
        ref={audioRef}
        src="https://azura.rbctelevision.org/listen/rbcradio/radio.mp3"
        preload="auto"
      />
      
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="bg-gradient-primary hover:opacity-90 transition-opacity p-4 rounded-full shadow-lg"
        >
          {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
        </button>
        
        <div className="flex-1 flex items-center gap-3">
          <Volume2 className="text-muted-foreground" />
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="flex-1"
          />
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {isPlaying ? "Now Playing" : "Ready to Play"}
        </p>
      </div>
    </div>
  );
};

export default AudioPlayer;
