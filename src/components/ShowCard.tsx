import { useQuery } from "@tanstack/react-query";
import { Podcast } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Show {
  id: string;
  title: string;
  description: string;
  language: string;
  author: string;
  has_custom_art: boolean;
}

interface ShowCardProps {
  show: Show;
  onClick: () => void;
}

const ShowCard = ({ show, onClick }: ShowCardProps) => {
  const { data: artUrl } = useQuery({
    queryKey: ["podcastArt", show.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-podcast-asset', {
          body: { type: 'art', podcastId: show.id }
        });
        if (error || !data?.url) {
          return `https://azura.rbctelevision.org/api/station/rbcradio/podcast/${show.id}/art`;
        }
        return data.url;
      } catch {
        return `https://azura.rbctelevision.org/api/station/rbcradio/podcast/${show.id}/art`;
      }
    },
    enabled: show.has_custom_art,
  });

  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary hover:shadow-glow transition-all group cursor-pointer"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {show.has_custom_art && artUrl ? (
          <img
            src={artUrl}
            alt={show.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
            <Podcast size={64} className="text-white" />
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{show.title}</h3>
        <p className="text-muted-foreground mb-3 line-clamp-2">
          {show.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{show.author}</span>
          <span className="text-primary font-semibold uppercase">{show.language}</span>
        </div>
      </div>
    </div>
  );
};

export default ShowCard;
