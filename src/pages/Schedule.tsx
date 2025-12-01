import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MiniPlayer from "@/components/MiniPlayer";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock } from "lucide-react";
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayName = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString([], { weekday: 'long' });
  };

  const groupedByDay = useMemo(() => {
    if (!data) return {};
    
    const groups: { [key: string]: ScheduleItem[] } = {};
    
    data.forEach(item => {
      const dayName = getDayName(item.start_timestamp);
      if (!groups[dayName]) {
        groups[dayName] = [];
      }
      groups[dayName].push(item);
    });
    
    // Sort items within each day by start time
    Object.keys(groups).forEach(day => {
      groups[day].sort((a, b) => a.start_timestamp - b.start_timestamp);
    });
    
    return groups;
  }, [data]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const availableDays = Object.keys(groupedByDay).sort((a, b) => 
    daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
  );

  // Get current day or first available day
  const currentDay = new Date().toLocaleDateString([], { weekday: 'long' });
  const defaultDay = availableDays.includes(currentDay) ? currentDay : availableDays[0] || 'Monday';

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
                <Tabs defaultValue={defaultDay} className="w-full">
                  <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-6">
                    {daysOfWeek.map((day) => (
                      <TabsTrigger 
                        key={day} 
                        value={day}
                        disabled={!availableDays.includes(day)}
                      >
                        {day}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {daysOfWeek.map((day) => (
                    <TabsContent key={day} value={day} className="space-y-4">
                      {groupedByDay[day] && groupedByDay[day].length > 0 ? (
                        groupedByDay[day].map((item) => (
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
