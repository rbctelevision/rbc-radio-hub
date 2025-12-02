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
      console.log('useSpotifyAlbumArt called with:', { originalArt, title, artist });
      
      // If it's already the default art, try to get Spotify art
      if (originalArt === DEFAULT_ALBUM_ART) {
        console.log('Default art detected, fetching from Spotify...');
        try {
          const { data, error } = await supabase.functions.invoke('get-spotify-album-art', {
            body: { title, artist }
          });

          console.log('Spotify API response:', { data, error });

          if (error) {
            console.error('Spotify API error:', error);
            throw error;
          }
          
          // If Spotify art is found, use it, otherwise fall back to original
          const result = data?.albumArt || originalArt;
          console.log('Using album art:', result);
          return result;
        } catch (error) {
          console.error('Failed to fetch Spotify album art:', error);
          return originalArt;
        }
      }
      
      console.log('Not default art, using original:', originalArt);
      // If it's not the default art, use the original
      return originalArt;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!title && !!artist,
    retry: 1, // Only retry once on failure
  });
};
