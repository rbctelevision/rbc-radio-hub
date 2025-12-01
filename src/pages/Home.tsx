import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Play, Pause, Volume2, Music } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";

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
}

const Home = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([80]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data, isLoading } = useQuery<NowPlayingData>({
    queryKey: ["nowPlaying"],
    queryFn: async () => {
      const response = await fetch("https://azura.rbctelevision.org/api/nowplaying/rbcradio");
      return response.json();
    },
    refetchInterval: 10000,
  });

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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 bg-gradient-radial">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <img 
                src="https://cdn.therealsy.com/RadioLogoTransparent.png"
                alt="RBC Radio Logo"
                className="w-64 h-auto mx-auto mb-8 animate-fade-in"
              />
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Your favorite music, shows, and podcasts streaming 24/7
              </p>
              
              {/* Combined Player and Now Playing */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-card border border-border rounded-xl p-6 shadow-glow">
                  <audio 
                    ref={audioRef} 
                    src="https://azura.rbctelevision.org/listen/rbcradio/radio.mp3"
                    preload="none"
                  />
                  
                  {/* Now Playing Info */}
                  {isLoading ? (
                    <div className="mb-6 animate-pulse">
                      <div className="h-6 bg-muted rounded w-1/3 mb-4 mx-auto"></div>
                      <div className="flex items-center gap-4 justify-center">
                        <div className="w-20 h-20 bg-muted rounded-lg"></div>
                        <div className="flex-1 max-w-xs">
                          <div className="h-6 bg-muted rounded mb-2"></div>
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    data?.now_playing && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4 justify-center">
                          <Music className="text-primary" size={20} />
                          <h2 className="text-lg font-bold text-primary">Now Playing</h2>
                        </div>
                        <div className="flex items-center gap-4 justify-center">
                          <img
                            src={data.now_playing.song.art}
                            alt="Album Art"
                            className="w-20 h-20 rounded-lg shadow-lg"
                          />
                          <div className="flex-1 max-w-xs text-left">
                            <h3 className="text-xl font-bold">{data.now_playing.song.title}</h3>
                            <p className="text-muted-foreground">{data.now_playing.song.artist}</p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                  
                  {/* Player Controls */}
                  <div className="flex items-center gap-4 justify-center pt-6 border-t border-border">
                    <button
                      onClick={togglePlay}
                      className="bg-gradient-primary hover:opacity-90 transition-opacity p-4 rounded-full shadow-lg"
                    >
                      {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
                    </button>
                    
                    <div className="flex items-center gap-3 flex-1 max-w-xs">
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
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
