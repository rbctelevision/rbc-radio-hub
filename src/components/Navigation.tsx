import { NavLink } from "./NavLink";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="flex items-center gap-3">
            <img 
              src="https://cdn.therealsy.com/RadioLogoTransparent.png" 
              alt="RBC Radio Logo" 
              className="h-12 w-auto"
            />
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              className="text-foreground/80 hover:text-foreground transition-colors font-semibold"
              activeClassName="text-primary"
            >
              Home
            </NavLink>
            <NavLink
              to="/schedule"
              className="text-foreground/80 hover:text-foreground transition-colors font-semibold"
              activeClassName="text-primary"
            >
              Schedule
            </NavLink>
            <NavLink
              to="/shows"
              className="text-foreground/80 hover:text-foreground transition-colors font-semibold"
              activeClassName="text-primary"
            >
              Shows
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-foreground p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <NavLink
              to="/"
              onClick={() => setIsOpen(false)}
              className="block text-foreground/80 hover:text-foreground transition-colors font-semibold py-2"
              activeClassName="text-primary"
            >
              Home
            </NavLink>
            <NavLink
              to="/schedule"
              onClick={() => setIsOpen(false)}
              className="block text-foreground/80 hover:text-foreground transition-colors font-semibold py-2"
              activeClassName="text-primary"
            >
              Schedule
            </NavLink>
            <NavLink
              to="/shows"
              onClick={() => setIsOpen(false)}
              className="block text-foreground/80 hover:text-foreground transition-colors font-semibold py-2"
              activeClassName="text-primary"
            >
              Shows
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
