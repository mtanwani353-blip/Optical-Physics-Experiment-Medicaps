import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default function FiberNA() {
  const [n1, setN1] = useState(1.48); // core
  const [n2, setN2] = useState(1.40); // cladding
  const [L, setL] = useState(10); // screen distance in cm

  // Ensure n1 > n2
  useEffect(() => {
    if (n2 >= n1) {
      setN2(Math.max(1.30, n1 - 0.01));
    }
  }, [n1, n2]);

  const sideRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  const theoreticalNA = Math.sqrt(Math.max(0, n1 * n1 - n2 * n2));
  const acceptanceAngle = Math.asin(Math.min(1, theoreticalNA));
  const acceptanceAngleDeg = acceptanceAngle * (180 / Math.PI);
  
  // Spot radius on screen: W/2 = L * tan(θ)
  const spotRadius = L * Math.tan(acceptanceAngle);
  const W = spotRadius * 2;

  const measuredNA = spotRadius / Math.sqrt(L * L + spotRadius * spotRadius);

  useEffect(() => {
    const canvas = sideRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    // Draw fiber
    const fiberHeight = 20;
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(0, height / 2 - fiberHeight/2, 100, fiberHeight);
    
    // Core
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(0, height / 2 - fiberHeight/4, 100, fiberHeight/2);

    // Light cone
    ctx.beginPath();
    ctx.moveTo(100, height / 2);
    
    // Max L slider is 20cm, map this to remaining width
    const maxL = 20;
    const xDist = 100 + (L / maxL) * (width - 150);
    
    // Pixel scale roughly
    const scale = (height / 2) / (maxL * Math.tan(Math.asin(1))); // rough scale
    const yDisp = spotRadius * scale * 3; // exaggerate for visual

    ctx.lineTo(xDist, height / 2 - yDisp);
    ctx.lineTo(xDist, height / 2 + yDisp);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(100, 0, xDist, 0);
    gradient.addColorStop(0, "rgba(239, 68, 68, 0.8)"); // Red laser
    gradient.addColorStop(1, "rgba(239, 68, 68, 0.2)");
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Screen line
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(xDist, 0);
    ctx.lineTo(xDist, height);
    ctx.stroke();

  }, [n1, n2, L, spotRadius]);

  useEffect(() => {
    const canvas = frontRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    // Draw spot
    const maxL = 20;
    const scale = (height / 2.5) / (maxL * Math.tan(Math.asin(1)));
    const r = spotRadius * scale * 3;

    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, r);
    gradient.addColorStop(0, "rgba(239, 68, 68, 1.0)");
    gradient.addColorStop(0.8, "rgba(239, 68, 68, 0.6)");
    gradient.addColorStop(1, "rgba(239, 68, 68, 0.0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(width/2, height/2, r, 0, Math.PI * 2);
    ctx.fill();

    // Measurement markers
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.moveTo(width/2 - r, height/2);
    ctx.lineTo(width/2 + r, height/2);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`W = ${W.toFixed(2)} cm`, width/2, height/2 - 10);

  }, [W, spotRadius]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Numerical Aperture of an Optical Fibre</h1>
        <p className="text-muted-foreground">Measure the light-gathering ability</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-black border-zinc-800 overflow-hidden">
              <div className="aspect-[4/3] w-full relative">
                <canvas 
                  ref={sideRef}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 text-xs text-muted-foreground font-mono bg-black/50 px-2 py-1 rounded">
                  Side View
                </div>
              </div>
            </Card>
            <Card className="bg-black border-zinc-800 overflow-hidden">
              <div className="aspect-[4/3] w-full relative">
                <canvas 
                  ref={frontRef}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 text-xs text-muted-foreground font-mono bg-black/50 px-2 py-1 rounded">
                  Screen View
                </div>
              </div>
            </Card>
          </div>
          
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ChevronDown className="h-4 w-4" /> Theory
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 text-sm text-muted-foreground space-y-2">
              <p>
                The Numerical Aperture (NA) of a fiber determines the maximum angle of incidence at which light can enter and be guided down the fiber via total internal reflection.
              </p>
              <p>
                Theoretical NA is given by <code className="text-primary font-mono bg-primary/10 px-1 rounded">NA = sqrt(n1² - n2²)</code>. 
                Experimentally, it is found by measuring the spot diameter <code>W</code> at distance <code>L</code>: <code className="text-primary font-mono bg-primary/10 px-1 rounded">NA = sin(θ) = (W/2)/sqrt(L² + (W/2)²)</code>.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Core Refractive Index (n1)</Label>
                  <span className="text-sm font-mono text-primary">{n1.toFixed(3)}</span>
                </div>
                <Slider 
                  value={[n1]} 
                  onValueChange={(v) => setN1(v[0])} 
                  min={1.40} max={1.55} step={0.01} 
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Cladding Refractive Index (n2)</Label>
                  <span className="text-sm font-mono text-primary">{n2.toFixed(3)}</span>
                </div>
                <Slider 
                  value={[n2]} 
                  onValueChange={(v) => {
                    const newN2 = v[0];
                    if (newN2 < n1) setN2(newN2);
                  }} 
                  min={1.30} max={1.50} step={0.01} 
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Screen Distance (L)</Label>
                  <span className="text-sm font-mono text-primary">{L} cm</span>
                </div>
                <Slider 
                  value={[L]} 
                  onValueChange={(v) => setL(v[0])} 
                  min={1} max={20} step={1} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Spot Diameter (W)</span>
                  <span className="font-mono">{W.toFixed(2)} cm</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Measured NA</span>
                  <span className="font-mono">{measuredNA.toFixed(4)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Theoretical NA</span>
                  <span className="font-mono">{theoreticalNA.toFixed(4)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Acceptance Angle</span>
                  <span className="font-mono">{acceptanceAngleDeg.toFixed(1)}°</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground font-medium">Formula</span>
                  <span className="font-mono text-primary bg-primary/10 px-2 rounded">NA = (W/2)/√(L²+(W/2)²)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
