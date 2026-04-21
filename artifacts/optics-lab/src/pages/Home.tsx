import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CircleDot, Maximize, Zap, Waves } from "lucide-react";

const experiments = [
  { 
    path: "/diffraction", 
    label: "Thickness of a Wire", 
    desc: "Use single-slit diffraction to measure microscopic diameters.",
    icon: Waves 
  },
  { 
    path: "/grating", 
    label: "Diffraction Grating", 
    desc: "Determine laser wavelength using multiple diffraction orders.",
    icon: Activity 
  },
  { 
    path: "/fiber-na", 
    label: "Fiber Numerical Aperture", 
    desc: "Measure the acceptance angle and NA of an optical fiber.",
    icon: Zap 
  },
  { 
    path: "/newtons-rings", 
    label: "Newton's Rings", 
    desc: "Find the radius of curvature of a lens via interference.",
    icon: CircleDot 
  },
  { 
    path: "/beam-divergence", 
    label: "Beam Divergence", 
    desc: "Measure the widening of a Gaussian laser beam over distance.",
    icon: Maximize 
  },
];

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Optical Physics Lab</h1>
        <p className="text-muted-foreground mt-2">
          A suite of virtual experiments to explore wave optics phenomena. Select an experiment to begin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {experiments.map((exp) => (
          <Link key={exp.path} href={exp.path}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <exp.icon className="h-5 w-5 text-primary" />
                  {exp.label}
                </CardTitle>
                <CardDescription>{exp.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
