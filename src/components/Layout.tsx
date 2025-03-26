
import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { seedDemoData } from "@/lib/api";
import { toast } from "sonner";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Seed demo data when the app loads and check API connectivity
    seedDemoData()
      .then(() => {
        setApiConnected(true);
      })
      .catch(error => {
        setApiConnected(false);
        toast.error("Couldn't connect to backend API", {
          description: "Using localStorage fallback. Some features may have limited functionality.",
          duration: 8000,
        });
        console.error("Error seeding demo data:", error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
        <div className="container px-4 py-6 md:px-6 md:py-10 mx-auto max-w-7xl">
          {apiConnected === false && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" /> 
                Backend API Connection Error
              </AlertTitle>
              <AlertDescription>
                Unable to connect to backend API. The app is currently using localStorage for data storage.
                Your data will be stored in your browser and might be lost if you clear browser data.
              </AlertDescription>
            </Alert>
          )}
          
          {apiConnected === true && (
            <Alert className="mb-6" variant="default">
              <AlertTitle className="flex items-center gap-2">
                <Wifi className="h-4 w-4" /> 
                Connected to Backend API
              </AlertTitle>
              <AlertDescription>
                Successfully connected to the backend API. All data will be stored on the server.
              </AlertDescription>
            </Alert>
          )}
          
          {children}
        </div>
      </main>
    </div>
  );
}
