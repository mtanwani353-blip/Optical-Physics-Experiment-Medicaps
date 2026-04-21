import { Link, useLocation } from "wouter";
import { Activity, CircleDot, Maximize, Zap, Waves, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const experiments = [
  { path: "/diffraction", label: "Wire Thickness", icon: Waves },
  { path: "/grating", label: "Diffraction Grating", icon: Activity },
  { path: "/fiber-na", label: "Fiber Numerical Aperture", icon: Zap },
  { path: "/newtons-rings", label: "Newton's Rings", icon: CircleDot },
  { path: "/beam-divergence", label: "Beam Divergence", icon: Maximize },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-4 border-b">
          <Link href="/" className="font-bold text-lg tracking-tight">Optical Physics Lab</Link>
          <div className="text-xs text-muted-foreground">Virtual Experiments</div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {experiments.map((exp) => (
            <Link key={exp.path} href={exp.path}>
              <Button
                variant={location === exp.path ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <exp.icon className="mr-2 h-4 w-4" />
                {exp.label}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-14 border-b flex items-center px-4 md:hidden bg-card">
          <Link href="/" className="font-bold text-lg tracking-tight">Optical Physics Lab</Link>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
