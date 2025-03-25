
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Receipt, 
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NavItem = ({ to, icon: Icon, label, active }: { 
  to: string; 
  icon: React.ElementType; 
  label: string;
  active: boolean;
}) => (
  <Link 
    to={to} 
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200",
      active 
        ? "bg-primary text-primary-foreground" 
        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/products", label: "Products", icon: Package },
    { path: "/checkout", label: "Checkout", icon: ShoppingCart },
    { path: "/receipts", label: "Receipts", icon: Receipt },
  ];
  
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r bg-card animate-in">
        <div className="p-6">
          <h1 className="text-2xl font-semibold tracking-tight">SimplePOS</h1>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          {navItems.map((item) => (
            <NavItem 
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              active={isActive(item.path)}
            />
          ))}
        </nav>
        
        <div className="p-6 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium">SP</span>
            </div>
            <div>
              <p className="text-sm font-medium">SimplePOS</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <header className={cn(
        "md:hidden fixed top-0 left-0 right-0 z-50 py-3 px-4 flex items-center justify-between transition-all duration-300 backdrop-blur-md",
        scrollPosition > 10 ? "bg-background/80 border-b" : "bg-transparent"
      )}>
        <h1 className="text-xl font-semibold">SimplePOS</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </header>
      
      {/* Mobile menu */}
      <div className={cn(
        "md:hidden fixed inset-0 z-40 bg-background transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="pt-16 pb-6 px-4 flex flex-col h-full">
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavItem 
                key={item.path}
                to={item.path}
                icon={item.icon}
                label={item.label}
                active={isActive(item.path)}
              />
            ))}
          </nav>
          
          <div className="pt-6 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">SP</span>
              </div>
              <div>
                <p className="text-sm font-medium">SimplePOS</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
