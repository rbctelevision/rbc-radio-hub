import { useState, useCallback } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Search, Send, Music, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";

interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  spotifyUrl: string;
}

interface SongRequestTabProps {
  onSuccess: () => void;
}

const SongRequestTab = ({ onSuccess }: SongRequestTabProps) => {
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSong, setSelectedSong] = useState<SpotifyTrack | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: searchResults, isLoading: isSearching } = useQuery<SpotifyTrack[]>({
    queryKey: ["spotifySearch", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) return [];
      
      const { data, error } = await supabase.functions.invoke("search-spotify", {
        body: { query: debouncedSearch },
      });

      if (error) throw error;
      return data.tracks || [];
    },
    enabled: debouncedSearch.length >= 2 && !selectedSong,
  });

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!selectedSong) {
      toast.error("Please select a song");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-request", {
        body: {
          type: "song",
          name: name.trim(),
          songTitle: selectedSong.title,
          songArtist: selectedSong.artist,
          spotifyUrl: selectedSong.spotifyUrl,
          albumArt: selectedSong.albumArt,
          comments: comments.trim() || undefined,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to submit request");

      toast.success("Song request submitted!");
      onSuccess();
    } catch (error: any) {
      console.error("Request error:", error);
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  }, [name, selectedSong, comments, onSuccess]);

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Name Input */}
      <div>
        <Label htmlFor="song-name">Your Name *</Label>
        <Input
          id="song-name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Song Selection */}
      {selectedSong ? (
        <div className="bg-card border border-primary rounded-lg p-4">
          <div className="flex items-center gap-3">
            <img
              src={selectedSong.albumArt || "/placeholder.svg"}
              alt={selectedSong.album}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold truncate">{selectedSong.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{selectedSong.artist}</p>
              <p className="text-xs text-muted-foreground truncate">{selectedSong.album}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedSong(null);
                setSearchQuery("");
              }}
            >
              Change
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <Label>Search for a Song *</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search songs on Spotify..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          <div className="flex-1 mt-2 overflow-y-auto space-y-2 min-h-[200px] max-h-[300px]">
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            )}
            
            {!isSearching && searchResults && searchResults.length > 0 && (
              searchResults.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setSelectedSong(track)}
                  className="w-full flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted rounded-lg text-left transition-colors"
                >
                  <img
                    src={track.albumArt || "/placeholder.svg"}
                    alt={track.album}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{track.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <Music className="text-muted-foreground flex-shrink-0" size={16} />
                </button>
              ))
            )}

            {!isSearching && debouncedSearch.length >= 2 && searchResults?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No songs found. Try a different search.
              </div>
            )}

            {!isSearching && debouncedSearch.length < 2 && (
              <div className="text-center py-8 text-muted-foreground">
                Start typing to search for songs...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Comments */}
      <div>
        <Label htmlFor="song-comments">Additional Comments (Optional)</Label>
        <Textarea
          id="song-comments"
          placeholder="Any special message or dedication..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !name.trim() || !selectedSong}
        className="w-full bg-gradient-primary hover:opacity-90"
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin mr-2" size={18} />
        ) : (
          <Send className="mr-2" size={18} />
        )}
        Submit Request
      </Button>
    </div>
  );
};

export default SongRequestTab;
