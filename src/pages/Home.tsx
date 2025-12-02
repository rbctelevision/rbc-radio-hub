import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Play, Pause, Volume2, Music, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { useAudio } from "@/contexts/AudioContext";
import SongRequestModal from "@/components/SongRequestModal";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { useSpotifyAlbumArt } from "@/hooks/useSpotifyAlbumArt";

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

const Home = () => {
  const { isPlaying, volume, togglePlay, setVolume } = useAudio();

  useSeoMeta({
    title: "RBC Radio - Live Streaming Radio Station | Music & Shows 24/7",
    description: "Listen to RBC Radio live for the best music, exclusive shows, and podcasts. Stream your favorite artists and programs 24/7.",
    canonical: "https://rbctelevision.org/",
    ogImage: "https://rbctelevision.org/og-image.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "RadioStation",
      "name": "RBC Radio",
      "url": "https://rbctelevision.org/",
      "description": "RBC Radio - live streaming radio with music, shows, and podcasts",
      "logo": "https://rbctelevision.org/og-image.png",
      "sameAs": ["https://twitter.com/rbc_television"],
      "potentialAction": {
        "@type": "ListenAction",
        "target": "https://rbctelevision.org/"
      }
    }
  });

  const { data, isLoading } = useQuery<NowPlayingData>({
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
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-card border border-border rounded-xl p-4 shadow-glow">
                  {/* Now Playing Info */}
                  {isLoading ? (
                    <div className="mb-4 animate-pulse">
                      <div className="h-6 bg-muted rounded w-1/3 mb-4 mx-auto"></div>
                      <div className="flex items-center gap-3 justify-center">
                        <div className="w-20 h-20 bg-muted rounded-lg"></div>
                        <div className="flex-1 max-w-md">
                          <div className="h-6 bg-muted rounded mb-2"></div>
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    data?.now_playing && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-4 justify-center">
                          <Music className="text-primary" size={20} />
                          <h2 className="text-lg font-bold text-primary">Now Playing</h2>
                        </div>
                        <div className="flex items-center gap-3 justify-center">
                          <img
                            src={albumArt || data.now_playing.song.art}
                            alt="Album Art"
                            className="w-20 h-20 rounded-lg shadow-lg flex-shrink-0"
                          />
                          <div className="flex-1 max-w-md min-w-0">
                            <h3 className="text-xl font-bold truncate">{data.now_playing.song.title}</h3>
                            <p className="text-muted-foreground truncate">{data.now_playing.song.artist}</p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                  
                  {/* Player Controls */}
                  <div className="flex items-center gap-4 justify-center pt-4 border-t border-border">
                    <button
                      onClick={togglePlay}
                      className="bg-gradient-primary hover:opacity-90 transition-opacity p-4 rounded-full shadow-lg flex-shrink-0"
                    >
                      {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
                    </button>
                    
                    <div className="flex items-center gap-3 flex-1 max-w-xs">
                      <Volume2 className="text-muted-foreground flex-shrink-0" />
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

                {/* Song Request Button */}
                <div className="flex justify-center">
                  <SongRequestModal />
                </div>

                {/* Song History */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-primary" />
                    <h2 className="text-xl font-bold">Recently Played</h2>
                  </div>
                  
                  <div className="space-y-3">
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <div key={i} className="bg-muted/50 rounded-lg p-3 animate-pulse h-16" />
                      ))
                    ) : (
                      data?.song_history?.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <img
                            src={item.song.art}
                            alt="Album Art"
                            className="w-12 h-12 rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{item.song.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{item.song.artist}</p>
                          </div>
                        </div>
                      ))
                    )}
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
