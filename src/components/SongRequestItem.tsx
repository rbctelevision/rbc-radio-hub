import { useSpotifyAlbumArt } from "@/hooks/useSpotifyAlbumArt";
import { Button } from "./ui/button";

interface SongRequestItemProps {
  requestId: string;
  title: string;
  artist: string;
  album: string;
  art: string;
  onRequest: (requestId: string) => void;
  isPending: boolean;
}

const SongRequestItem = ({ requestId, title, artist, album, art, onRequest, isPending }: SongRequestItemProps) => {
  const { data: albumArt } = useSpotifyAlbumArt(art, title, artist);

  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary transition-colors">
      <img 
        src={albumArt || art} 
        alt="Album Art" 
        className="w-16 h-16 rounded" 
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{artist}</p>
        {album && (
          <p className="text-xs text-muted-foreground truncate">{album}</p>
        )}
      </div>
      <Button
        onClick={() => onRequest(requestId)}
        disabled={isPending}
        size="sm"
      >
        Request
      </Button>
    </div>
  );
};

export default SongRequestItem;
