import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_ALBUM_ART = "https://azura.rbctelevision.org/static/uploads/album_art.1764542764.png";

export const useSpotifyAlbumArt = (
  originalArt: string,
  title: string,
  artist: string
) => {
  return useQuery({
    queryKey: ["spotify-album-art", title, artist],
    queryFn: async () => {
      // If it's already the default art, try to get Spotify art
      if (originalArt === DEFAULT_ALBUM_ART) {
        try {
          const { data, error } = await supabase.functions.invoke('get-spotify-album-art', {
            body: { title, artist }
          });

          if (error) throw error;
          
          // If Spotify art is found, use it, otherwise fall back to original
          return data?.albumArt || originalArt;
        } catch (error) {
          console.error('Failed to fetch Spotify album art:', error);
          return originalArt;
        }
      }
      
      // If it's not the default art, use the original
      return originalArt;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!title && !!artist,
  });
};
