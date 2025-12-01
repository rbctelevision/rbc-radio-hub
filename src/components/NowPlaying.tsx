import { useQuery } from "@tanstack/react-query";
import { Music, Clock } from "lucide-react";

interface Song {
  song: {
    title: string;
    artist: string;
    art: string;
  };
  played_at: number;
}

interface NowPlayingData {
  now_playing: Song;
  song_history: Song[];
}

const NowPlaying = () => {
  const { data, isLoading } = useQuery<NowPlayingData>({
    queryKey: ["nowPlaying"],
    queryFn: async () => {
      const response = await fetch("https://azura.rbctelevision.org/api/nowplaying/rbcradio");
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Song */}
      <div className="bg-gradient-primary rounded-xl p-6 shadow-glow">
        <div className="flex items-center gap-2 mb-4">
          <Music className="text-white" />
          <h2 className="text-xl font-bold text-white">Now Playing</h2>
        </div>
        
        {data?.now_playing && (
          <div className="flex items-center gap-4">
            <img
              src={data.now_playing.song.art}
              alt="Album Art"
              className="w-20 h-20 rounded-lg shadow-lg"
            />
            <div className="flex-1 text-white">
              <h3 className="text-2xl font-bold">{data.now_playing.song.title}</h3>
              <p className="text-lg opacity-90">{data.now_playing.song.artist}</p>
            </div>
          </div>
        )}
      </div>

      {/* Song History */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-primary" />
          <h2 className="text-xl font-bold">Recently Played</h2>
        </div>
        
        <div className="space-y-3">
          {data?.song_history?.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <img
                src={item.song.art}
                alt="Album Art"
                className="w-12 h-12 rounded"
              />
              <div className="flex-1">
                <p className="font-semibold">{item.song.title}</p>
                <p className="text-sm text-muted-foreground">{item.song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
