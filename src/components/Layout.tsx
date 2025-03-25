
import { useEffect } from "react";
import { Navbar } from "./Navbar";
import { seedDemoData } from "@/lib/db";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useEffect(() => {
    // Seed demo data when the app loads
    seedDemoData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="md:ml-64 min-h-screen pt-16 md:pt-0">
        <div className="container px-4 py-6 md:px-6 md:py-10 mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
