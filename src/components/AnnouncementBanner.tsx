import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
}

const typeStyles = {
  info: {
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-400",
    icon: Info,
  },
  warning: {
    bg: "bg-yellow-500/10 border-yellow-500/20",
    text: "text-yellow-400",
    icon: AlertTriangle,
  },
  success: {
    bg: "bg-green-500/10 border-green-500/20",
    text: "text-green-400",
    icon: CheckCircle,
  },
  error: {
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-red-400",
    icon: AlertCircle,
  },
};

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, message, type")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAnnouncements(data as Announcement[]);
      }
    };

    fetchAnnouncements();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("announcements-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissedIds.has(a.id)
  );

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-2">
      {visibleAnnouncements.map((announcement) => {
        const style = typeStyles[announcement.type] || typeStyles.info;
        const Icon = style.icon;

        return (
          <div
            key={announcement.id}
            className={cn(
              "relative flex items-center gap-3 px-4 py-3 border rounded-lg",
              style.bg
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0", style.text)} />
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium text-sm", style.text)}>
                {announcement.title}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {announcement.message}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(announcement.id)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors shrink-0"
              aria-label="Dismiss announcement"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;
