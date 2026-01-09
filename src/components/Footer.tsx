import { Youtube, Twitter } from "lucide-react";

// Discord icon component
const DiscordIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    style={{ width: '24px', height: '24px' }}
    role="img"
    aria-label="Discord"
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
  </svg>
);

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
                href="https://go.rbctelevision.org/discord"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-muted hover:bg-primary transition-colors p-3 rounded-lg"
                aria-label="Discord"
              >
                <DiscordIcon />
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
          <p>&copy; 2026 RBC Television. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
