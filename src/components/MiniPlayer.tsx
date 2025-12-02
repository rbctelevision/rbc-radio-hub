import { Play, Pause, Volume2 } from "lucide-react";
import { Slider } from "./ui/slider";
import { useAudio } from "@/contexts/AudioContext";
import { useQuery } from "@tanstack/react-query";
import { useSpotifyAlbumArt } from "@/hooks/useSpotifyAlbumArt";

interface Song {
  song: {
    title: string;
    artist: string;
    art: string;
  };
}

interface NowPlayingData {
  now_playing: Song;
}

const MiniPlayer = () => {
  const { isPlaying, volume, togglePlay, setVolume } = useAudio();

  const { data } = useQuery<NowPlayingData>({
    queryKey: ["nowPlaying"],
    queryFn: async () => {
      const response = await fetch("https://azura.rbctelevision.org/api/nowplaying/rbcradio");
      return response.json();
    },
    refetchInterval: 10000,
  });

  const { data: albumArt } = useSpotifyAlbumArt(
    data?.now_playing?.song?.art || "",
    data?.now_playing?.song?.title || "",
    data?.now_playing?.song?.artist || ""
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 max-w-5xl mx-auto">
          <button
            onClick={togglePlay}
            className="bg-gradient-primary hover:opacity-90 transition-opacity p-4 rounded-full shadow-lg flex-shrink-0"
          >
            {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
          </button>
          
          {data?.now_playing && (
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img
                src={albumArt || data.now_playing.song.art}
                alt="Album Art"
                className="w-16 h-16 rounded shadow-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate text-base">{data.now_playing.song.title}</p>
                <p className="text-sm text-muted-foreground truncate">{data.now_playing.song.artist}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3 flex-shrink-0 w-48">
            <Volume2 className="text-muted-foreground flex-shrink-0" size={20} />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
