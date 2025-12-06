import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MiniPlayer from "@/components/MiniPlayer";
import CustomAudioPlayer from "@/components/CustomAudioPlayer";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Episode {
  id: string;
  title: string;
  description: string;
  publish_at: number;
  has_custom_art: boolean;
  media: {
    length: number;
    path: string;
  };
}

interface Show {
  id: string;
  title: string;
  description: string;
  language: string;
  author: string;
  has_custom_art: boolean;
}

const ShowDetail = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const { data: show, isLoading: showLoading } = useQuery<Show>({
    queryKey: ["show", showId],
    queryFn: async () => {
      const response = await fetch(
        `https://azura.rbctelevision.org/api/station/rbcradio/public/podcast/${showId}`
      );
      return response.json();
    },
  });

  const { data: episodes, isLoading: episodesLoading } = useQuery<Episode[]>({
    queryKey: ["episodes", showId],
    queryFn: async () => {
      const response = await fetch(
        `https://azura.rbctelevision.org/api/station/rbcradio/public/podcast/${showId}/episodes`
      );
      return response.json();
    },
  });

  // Podcast art endpoint is public - use direct URL
  const podcastArtUrl = showId ? `https://azura.rbctelevision.org/api/station/rbcradio/podcast/${showId}/art` : null;

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}`;
    }
    return `${mins}:00`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Navigation />
      <MiniPlayer />

      <main className="flex-1 pt-20">
        <section className="py-16 bg-gradient-radial">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => navigate("/shows")}
                className="flex items-center gap-2 text-primary hover:text-primary-glow transition-colors mb-6"
              >
                <ArrowLeft size={20} />
                <span className="font-semibold">Back to Shows</span>
              </button>

              {showLoading ? (
                <div className="animate-pulse">
                  <div className="h-64 bg-muted rounded-xl mb-6"></div>
                  <div className="h-8 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              ) : show ? (
                <>
                  <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
                    <div className="md:flex">
                      <div className="md:w-1/3 aspect-square bg-muted">
                        {show.has_custom_art && podcastArtUrl ? (
                          <img
                            src={podcastArtUrl}
                            alt={show.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                            <span className="text-6xl font-black text-white">
                              {show.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="md:w-2/3 p-6">
                        <h1 className="text-4xl font-black mb-4">{show.title}</h1>
                        <p className="text-muted-foreground mb-4">{show.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">{show.author}</span>
                          <span className="text-primary font-semibold uppercase">
                            {show.language}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-6">Episodes</h2>
                    {episodesLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="bg-card border border-border rounded-xl p-6 animate-pulse"
                          >
                            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : episodes && episodes.length > 0 ? (
                      <div className="space-y-4">
                        {episodes.map((episode) => (
                          <EpisodeItem
                            key={episode.id}
                            episode={episode}
                            showId={showId!}
                            formatDate={formatDate}
                            formatDuration={formatDuration}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-card border border-border rounded-xl p-12 text-center">
                        <p className="text-muted-foreground text-lg">
                          No episodes available for this show.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

interface EpisodeItemProps {
  episode: Episode;
  showId: string;
  formatDate: (timestamp: number) => string;
  formatDuration: (seconds: number) => string;
}

const EpisodeItem = ({ episode, showId, formatDate, formatDuration }: EpisodeItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: episodeDetail } = useQuery({
    queryKey: ["episode", showId, episode.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-podcast-asset', {
        body: { type: 'episode', podcastId: showId, episodeId: episode.id }
      });
      if (error) throw error;
      return data;
    },
    enabled: isOpen,
  });

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-colors"
    >
      <CollapsibleTrigger className="w-full p-6 text-left">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-2 truncate">{episode.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {formatDate(episode.publish_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {formatDuration(episode.media.length)}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`flex-shrink-0 text-primary transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            size={24}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-6 pb-6 border-t border-border pt-4">
          <p className="text-muted-foreground mb-4">{episode.description}</p>
          {episodeDetail?.links?.download && (
            <CustomAudioPlayer 
              src={episodeDetail.links.download}
              duration={episodeDetail.media?.length || episode.media.length}
            />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ShowDetail;
