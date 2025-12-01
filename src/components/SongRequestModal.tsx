import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Music, Search } from "lucide-react";
import { toast } from "sonner";

interface RequestableSong {
  request_id: string;
  song: {
    id: string;
    title: string;
    artist: string;
    album: string;
    art: string;
  };
}

const SongRequestModal = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: songs, isLoading } = useQuery<RequestableSong[]>({
    queryKey: ["requestableSongs"],
    queryFn: async () => {
      const response = await fetch("https://azura.rbctelevision.org/api/station/rbcradio/requests");
      return response.json();
    },
    enabled: open,
  });

  const requestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await fetch(
        `https://azura.rbctelevision.org/api/station/rbcradio/request/${requestId}`,
        { method: "POST" }
      );

      // Attempt to parse JSON body (API may return useful message even on non-2xx)
      let body: any = null;
      try {
        body = await response.json();
      } catch (e) {
        // ignore JSON parse errors
      }

      // Prefer server-side success flag/message when available
      if (body && typeof body.success !== "undefined") {
        if (!body.success) {
          throw new Error(body.message || "Failed to request song");
        }
        return body;
      }

      // Fallback to HTTP status
      if (!response.ok) {
        throw new Error(body?.message || "Failed to request song");
      }

      return body ?? {};
    },
    onMutate: (requestId: string) => {
      // Optimistic feedback: show a success toast immediately and close modal.
      // If the request ultimately fails, we'll reopen the modal in onError.
      toast.success("Your request has been submitted and will be played soon.");
      setOpen(false);
      return { requestId };
    },
    onSuccess: (data: any) => {
      // Show server-provided message when available (may be more descriptive)
      const msg = data?.message || "Song requested successfully!";
      toast.success(msg);
    },
    onError: (err: any, _variables, context) => {
      const message = err?.message || "Failed to request song. Please try again.";
      toast.error(message);
      // Re-open modal so user can retry if the optimistic success was shown
      if (context?.requestId) {
        setOpen(true);
      }
    },
  });

  const filteredSongs = songs?.filter(
    (song) =>
      song.song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Music className="mr-2" size={20} />
          Request a Song
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Request a Song</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search songs or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg p-3 animate-pulse h-20" />
              ))}
            </div>
          ) : filteredSongs && filteredSongs.length > 0 ? (
            filteredSongs.map((item) => (
              <div
                key={item.request_id}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary transition-colors"
              >
                <img
                  src={item.song.art}
                  alt="Album Art"
                  className="w-16 h-16 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.song.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{item.song.artist}</p>
                  {item.song.album && (
                    <p className="text-xs text-muted-foreground truncate">{item.song.album}</p>
                  )}
                </div>
                <Button
                  onClick={() => requestMutation.mutate(item.request_id)}
                  disabled={requestMutation.isPending}
                  size="sm"
                >
                  Request
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No songs found matching your search." : "No songs available for request."}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SongRequestModal;
