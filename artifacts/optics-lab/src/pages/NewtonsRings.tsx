import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { wavelengthToRGB } from "@/lib/optics";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default function NewtonsRings() {
  const [lambda, setLambda] = useState(589); // nm (sodium yellow default)
  const [R, setR] = useState(1.0); // m
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    const color = wavelengthToRGB(lambda);
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return;
    const [_, r, g, b] = match;
    const baseR = parseInt(r);
    const baseG = parseInt(g);
    const baseB = parseInt(b);

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const cx = width / 2;
    const cy = height / 2;
    
    // Let canvas represent a 1cm x 1cm area
    // R is in m, lambda is in nm = 1e-9 m
    // r_n = sqrt(n * lambda * R)
    // max radius for n=10 is approx sqrt(10 * 500e-9 * 1) = 2.2mm
    const viewSize = 0.005; // 5mm
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // physical distance from center in meters
        const dx = ((x - cx) / width) * viewSize;
        const dy = ((y - cy) / height) * viewSize;
        const distSq = dx*dx + dy*dy;
        
        // Intensity formula: I ∝ sin²(π·r²/(λ·R)) for reflected
        const lambda_m = lambda * 1e-9;
        
        // Phase difference = (2π/λ) * (2t) + π (for reflection)
        // t = r² / 2R
        // Path diff = r² / R
        // Phase diff = 2π * r² / (λR) + π
        // Intensity = I0 * cos²(PhaseDiff / 2) = I0 * cos²(π r² / λR + π/2) = I0 * sin²(π r² / λR)
        
        const phase = (Math.PI * distSq) / (lambda_m * R);
        const intensity = Math.pow(Math.sin(phase), 2);
        
        const idx = (y * width + x) * 4;
        data[idx] = baseR * intensity;
        data[idx + 1] = baseG * intensity;
        data[idx + 2] = baseB * intensity;
        data[idx + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Draw scale
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.moveTo(10, height - 20);
    ctx.lineTo(10 + (0.001 / viewSize) * width, height - 20);
    ctx.stroke();
    
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "10px monospace";
    ctx.fillText("1 mm", 10, height - 25);

  }, [lambda, R]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Newton's Rings</h1>
        <p className="text-muted-foreground">Determine the radius of curvature of a plano-convex lens</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-black border-zinc-800 overflow-hidden">
            <div className="aspect-square w-full max-w-lg mx-auto relative">
              <canvas 
                ref={canvasRef}
                width={500}
                height={500}
                className="w-full h-full object-cover rounded-full"
                style={{ clipPath: "circle(50% at 50% 50%)" }}
              />
            </div>
          </Card>
          
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ChevronDown className="h-4 w-4" /> Theory
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 text-sm text-muted-foreground space-y-2">
              <p>
                Newton's rings are formed due to interference between light reflected from the top and bottom surfaces of an air film between a plano-convex lens and a flat glass plate.
              </p>
              <p>
                The central spot is dark in reflected light due to a phase shift of π upon reflection from the denser glass boundary. 
                The radius of the nth dark ring is <code className="text-primary font-mono bg-primary/10 px-1 rounded">r_n = sqrt(nλR)</code>. 
                By measuring diameters, we find <code className="text-primary font-mono bg-primary/10 px-1 rounded">R = (D_n² - D_m²)/(4(n-m)λ)</code>.
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
                  <Label>Wavelength (λ)</Label>
                  <span className="text-sm font-mono text-primary">{lambda} nm</span>
                </div>
                <Slider 
                  value={[lambda]} 
                  onValueChange={(v) => setLambda(v[0])} 
                  min={400} max={700} step={1} 
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Radius of Curvature (R)</Label>
                  <span className="text-sm font-mono text-primary">{R.toFixed(2)} m</span>
                </div>
                <Slider 
                  value={[R]} 
                  onValueChange={(v) => setR(v[0])} 
                  min={0.5} max={5.0} step={0.1} 
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
                  <span className="text-muted-foreground">Dark Ring n=1 Diameter</span>
                  <span className="font-mono">{(2 * Math.sqrt(1 * lambda * 1e-9 * R) * 1000).toFixed(3)} mm</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Dark Ring n=5 Diameter</span>
                  <span className="font-mono">{(2 * Math.sqrt(5 * lambda * 1e-9 * R) * 1000).toFixed(3)} mm</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Dark Ring n=10 Diameter</span>
                  <span className="font-mono">{(2 * Math.sqrt(10 * lambda * 1e-9 * R) * 1000).toFixed(3)} mm</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground font-medium">Formula</span>
                  <span className="font-mono text-primary bg-primary/10 px-2 rounded">D_n = 2√(nλR)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
