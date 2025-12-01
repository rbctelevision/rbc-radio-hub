import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";
import NowPlaying from "@/components/NowPlaying";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 bg-gradient-radial">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <img 
                src="https://cdn.therealsy.com/RadioLogoTransparent.png"
                alt="RBC Radio Logo"
                className="w-64 h-auto mx-auto mb-8 animate-fade-in"
              />
              <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-primary bg-clip-text text-transparent">
                RBC RADIO
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Your favorite music, shows, and podcasts streaming 24/7
              </p>
              
              <div className="max-w-md mx-auto">
                <AudioPlayer />
              </div>
            </div>
          </div>
        </section>

        {/* Now Playing Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <NowPlaying />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-glow transition-shadow">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎵</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Live 24/7</h3>
                <p className="text-muted-foreground">
                  Non-stop music streaming around the clock
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-glow transition-shadow">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎙️</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Amazing Shows</h3>
                <p className="text-muted-foreground">
                  Listen to exclusive podcasts and radio shows
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-glow transition-shadow">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📻</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Easy Listening</h3>
                <p className="text-muted-foreground">
                  Simple interface, high-quality streaming
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
