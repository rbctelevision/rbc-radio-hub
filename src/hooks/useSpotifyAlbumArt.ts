import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSpotifyAlbumArt = (
  originalArt: string,
  title: string,
  artist: string
) => {
  return useQuery({
    queryKey: ["album-art", title, artist],
    queryFn: async () => {
      console.log('useSpotifyAlbumArt called with:', { originalArt, title, artist });
      
      // Always try to fetch better album art from Spotify/iTunes
      try {
        const { data, error } = await supabase.functions.invoke('get-spotify-album-art', {
          body: { title, artist }
        });

        console.log('Album art API response:', { data, error });

        if (error) {
          console.error('Album art API error:', error);
          return originalArt;
        }
        
        // If album art is found, use it, otherwise fall back to original
        const result = data?.albumArt || originalArt;
        console.log('Using album art:', result);
        return result;
      } catch (error) {
        console.error('Failed to fetch album art:', error);
        return originalArt;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!title && !!artist,
    retry: 1,
  });
};
