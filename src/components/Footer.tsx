import { Youtube, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <img 
              src="https://cdn.therealsy.com/RadioLogoTransparent.png" 
              alt="RBC Radio Logo" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-muted-foreground">
              Your favorite music, shows, and podcasts streaming 24/7
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/schedule" className="text-muted-foreground hover:text-primary transition-colors">
                  Schedule
                </a>
              </li>
              <li>
                <a href="/shows" className="text-muted-foreground hover:text-primary transition-colors">
                  Shows
                </a>
              </li>
              <li>
                <a 
                  href="https://www.rbctelevision.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  RBC Television
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a 
                href="https://www.youtube.com/@RBCTelevisionRoblox"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted hover:bg-primary transition-colors p-3 rounded-lg"
              >
                <Youtube size={24} />
              </a>
              <a 
                href="https://x.com/rbc_television"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted hover:bg-primary transition-colors p-3 rounded-lg"
              >
                <Twitter size={24} />
              </a>
              <a 
                href="https://www.roblox.com/communities/16419897/RBC-Television#!/about"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted hover:bg-primary transition-colors p-3 rounded-lg inline-flex items-center justify-center"
                aria-label="Roblox community"
              >
                <svg 
                  className="niftybutton-rbx" 
                  preserveAspectRatio="xMidYMid meet" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg" 
                  style={{ display: 'block', width: '24px', height: '24px' }}
                  role="img" 
                  aria-label="Roblox"
                >
                  <title>Roblox icon</title>
                  <path d="M18.926 23.998 0 18.892 5.075.002 24 5.108ZM15.348 10.09l-5.282-1.453-1.414 5.273 5.282 1.453z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; 2025 RBC Television. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
