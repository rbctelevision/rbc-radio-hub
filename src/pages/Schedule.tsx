import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock } from "lucide-react";

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
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

            <div className="max-w-4xl mx-auto space-y-4">
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
                data?.map((item) => (
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
