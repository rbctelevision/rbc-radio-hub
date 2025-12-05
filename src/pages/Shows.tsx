import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MiniPlayer from "@/components/MiniPlayer";
import { useQuery } from "@tanstack/react-query";
import { Podcast } from "lucide-react";
import { useSeoMeta } from "@/hooks/useSeoMeta";
import { useNavigate } from "react-router-dom";
import ShowCard from "@/components/ShowCard";

interface Show {
  id: string;
  title: string;
  description: string;
  language: string;
  author: string;
  has_custom_art: boolean;
}

const Shows = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery<Show[]>({
    queryKey: ["shows"],
    queryFn: async () => {
      const response = await fetch("https://azura.rbctelevision.org/api/station/rbcradio/public/podcasts");
      return response.json();
    },
  });

  useSeoMeta({
    title: "RBC Radio Shows & Podcasts - Exclusive Audio Programs",
    description: "Discover RBC Radio's exclusive collection of shows and podcasts. Listen to your favorite audio programs and exclusive content.",
    canonical: "https://rbctelevision.org/shows",
    ogImage: "https://rbctelevision.org/og-image.png",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "RBC Radio Shows & Podcasts",
      "url": "https://rbctelevision.org/shows",
      "description": "Browse all RBC Radio shows and podcasts",
      "isPartOf": {
        "@type": "BroadcastService",
        "name": "RBC Radio"
      }
    }
  });

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Navigation />
      <MiniPlayer />
      
      <main className="flex-1 pt-20">
        <section className="py-16 bg-gradient-radial">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Podcast className="text-primary" size={40} />
                <h1 className="text-5xl font-black bg-gradient-primary bg-clip-text text-transparent">
                  Shows & Podcasts
                </h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Discover our exclusive collection of shows and podcasts
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : data && data.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {data.map((show) => (
                  <ShowCard
                    key={show.id}
                    show={show}
                    onClick={() => navigate(`/shows/${show.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-12 text-center max-w-2xl mx-auto">
                <p className="text-muted-foreground text-lg">
                  No shows available to be displayed.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shows;
