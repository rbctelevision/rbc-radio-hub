import { useSpotifyAlbumArt } from "@/hooks/useSpotifyAlbumArt";

interface SongHistoryItemProps {
  title: string;
  artist: string;
  art: string;
}

const SongHistoryItem = ({ title, artist, art }: SongHistoryItemProps) => {
  const { data: albumArt } = useSpotifyAlbumArt(art, title, artist);

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
      <img
        src={albumArt || art}
        alt="Album Art"
        className="w-12 h-12 rounded flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{artist}</p>
      </div>
    </div>
  );
};

export default SongHistoryItem;
