import { Play, Pause, Volume2 } from "lucide-react";
import { Slider } from "./ui/slider";
import { useAudio } from "@/contexts/AudioContext";

const MiniPlayer = () => {
  const { isPlaying, volume, togglePlay, setVolume } = useAudio();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <button
            onClick={togglePlay}
            className="bg-gradient-primary hover:opacity-90 transition-opacity p-3 rounded-full shadow-lg flex-shrink-0"
          >
            {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
          </button>
          
          <div className="flex-1 flex items-center gap-3">
            <Volume2 className="text-muted-foreground flex-shrink-0" size={20} />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
          
          <div className="text-sm text-muted-foreground hidden sm:block flex-shrink-0">
            RBC Radio
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
