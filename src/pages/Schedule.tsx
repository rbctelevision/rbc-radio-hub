import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MiniPlayer from "@/components/MiniPlayer";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSeoMeta } from "@/hooks/useSeoMeta";

interface ScheduleItem {
  id: number;
  name: string;
  start_timestamp: number;
  end_timestamp: number;
  is_now: boolean;
}

const Schedule = () => {
  const { data, isLoading } = useQuery<ScheduleItem[]>({
    queryKey: ["schedule"],
    queryFn: async () => {
      const response = await fetch("https://azura.rbctelevision.org/api/station/rbcradio/schedule");
      return response.json();
    },
  });

  useSeoMeta({
    title: "RBC Radio Schedule - Music, Shows & Podcasts | 10-Day Planner",
    description: "Check the RBC Radio 10-day schedule. Browse upcoming shows, music programs, and podcasts. Find what's playing now and coming soon.",
    canonical: "https://rbctelevision.org/schedule",
    ogImage: "https://rbctelevision.org/og-image.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BroadcastEvent",
      "name": "RBC Radio Schedule",
      "url": "https://rbctelevision.org/schedule",
      "isPartOf": {
        "@type": "BroadcastService",
        "name": "RBC Radio"
      }
    }
  });

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper to build a local YYYY-MM-DD key (avoids timezone issues with toISOString)
  const toDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Build an array of the next 10 days (including today)
  const days = useMemo(() => {
    const arr: { key: string; date: Date; weekday: string; label: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = toDateKey(d);
      const weekday = d.toLocaleDateString([], { weekday: "long" });
      const label = d.toLocaleDateString([], { month: "short", day: "numeric" });
      arr.push({ key, date: d, weekday, label });
    }
    return arr;
  }, []);

  // Group schedule items by exact date key (YYYY-MM-DD)
  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: ScheduleItem[] } = {};
    if (!data) return groups;
    data.forEach((item) => {
      const itemDate = new Date(item.start_timestamp * 1000);
      const key = toDateKey(itemDate);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    // sort within each group
    Object.keys(groups).forEach((k) => {
      groups[k].sort((a, b) => a.start_timestamp - b.start_timestamp);
    });

    return groups;
  }, [data]);

  const todayKey = toDateKey(new Date());

  const tabsListRef = useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const el = tabsListRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollWidth > el.clientWidth + 1);
  }, [days]);

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Navigation />
      <MiniPlayer />
      
      <main className="flex-1 pt-20">
        <section className="py-16 bg-gradient-radial">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Calendar className="text-primary" size={40} />
                <h1 className="text-5xl font-black bg-gradient-primary bg-clip-text text-transparent">
                  Schedule
                </h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Check out what's playing on RBC Radio
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                      <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <Tabs defaultValue={todayKey} className="w-full">
                  <div className="relative mb-6">
                    {showLeft && (
                      <button
                        aria-label="Scroll days left"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-card/80 hover:bg-card"
                        onClick={() => {
                          tabsListRef.current?.scrollBy({ left: -180, behavior: "smooth" });
                        }}
                      >
                        <ChevronLeft size={18} />
                      </button>
                    )}

                    <TabsList
                      ref={tabsListRef}
                      onScroll={() => {
                        const el = tabsListRef.current;
                        if (!el) return;
                        setShowLeft(el.scrollLeft > 0);
                        setShowRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 1);
                      }}
                      className="w-full justify-start overflow-x-auto flex-nowrap hide-scrollbar px-10"
                    >
                      {days.map((day) => (
                        <TabsTrigger key={day.key} value={day.key}>
                          <div className="flex items-center justify-between w-full">
                            <span>{day.weekday}</span>
                            <span className="text-sm text-muted-foreground">({day.label})</span>
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {showRight && (
                      <button
                        aria-label="Scroll days right"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-card/80 hover:bg-card"
                        onClick={() => {
                          tabsListRef.current?.scrollBy({ left: 180, behavior: "smooth" });
                        }}
                      >
                        <ChevronRight size={18} />
                      </button>
                    )}
                  </div>

                  {days.map((day) => (
                    <TabsContent key={day.key} value={day.key} className="space-y-4">
                      {groupedByDate[day.key] && groupedByDate[day.key].length > 0 ? (
                        groupedByDate[day.key].map((item) => (
                          <div
                            key={item.id}
                            className={`bg-card border rounded-xl p-6 transition-all ${
                              item.is_now 
                                ? 'border-primary shadow-glow scale-105' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock size={16} />
                                  <span>
                                    {formatTime(item.start_timestamp)} - {formatTime(item.end_timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {formatDate(item.start_timestamp)}
                                </p>
                              </div>
                              
                              {item.is_now && (
                                <div className="bg-gradient-primary px-4 py-2 rounded-full">
                                  <span className="text-white font-bold text-sm">ON AIR</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-card border border-border rounded-xl p-12 text-center">
                          <p className="text-muted-foreground text-lg">
                            No shows available for this day.
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Schedule;
