import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { wavelengthToRGB } from "@/lib/optics";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default function Diffraction() {
  const [lambda, setLambda] = useState(633); // nm
  const [d, setD] = useState(0.1); // mm
  const [D, setDDist] = useState(1.0); // m
  
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
    
    // Pattern parameters
    // I(θ) = I0 * (sin(β)/β)^2
    // β = π * d * sin(θ) / λ
    // sin(θ) ≈ x / D for small angles
    // So β ≈ (π * d * x) / (λ * D)
    
    // Real world units:
    // d in mm = d * 10^-3 m
    // λ in nm = λ * 10^-9 m
    // D in m
    // x in m
    
    const d_m = d * 1e-3;
    const lambda_m = lambda * 1e-9;
    
    // Let's say canvas represents [-10cm, +10cm] = 20cm total width
    const screenWidth_m = 0.2; 
    
    // Extract RGB from string "rgb(r, g, b)"
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return;
    const [_, r, g, b] = match;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < width; i++) {
      // mapped x from center in meters
      const x_m = (i / width - 0.5) * screenWidth_m;
      
      let intensity = 1.0;
      if (x_m !== 0) {
        const beta = (Math.PI * d_m * x_m) / (lambda_m * D);
        intensity = Math.pow(Math.sin(beta) / beta, 2);
      }

      // boost intensity slightly for visualization
      intensity = Math.min(1.0, intensity * 1.5);
      
      const ir = parseInt(r) * intensity;
      const ig = parseInt(g) * intensity;
      const ib = parseInt(b) * intensity;

      for (let j = 0; j < height; j++) {
        const idx = (j * width + i) * 4;
        data[idx] = ir;
        data[idx + 1] = ig;
        data[idx + 2] = ib;
        data[idx + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);

  }, [lambda, d, D]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Thickness of a Wire</h1>
        <p className="text-muted-foreground">Using single-slit diffraction</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-black border-zinc-800 overflow-hidden">
            <div className="aspect-[3/1] w-full relative">
              <canvas 
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 py-1 text-[10px] text-white/50 bg-black/50">
                <span>-10 cm</span>
                <span>0</span>
                <span>+10 cm</span>
              </div>
            </div>
          </Card>
          
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ChevronDown className="h-4 w-4" /> Theory
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 text-sm text-muted-foreground space-y-2">
              <p>
                According to Babinet's principle, the diffraction pattern of a thin wire is identical to that of a single slit of the same width. 
                When a laser beam strikes the wire, it produces a central bright fringe flanked by alternating dark and bright bands.
              </p>
              <p>
                The minima (dark fringes) occur where <code className="text-primary font-mono bg-primary/10 px-1 rounded">d sin(θ) = nλ</code>. 
                For small angles, <code className="text-primary font-mono bg-primary/10 px-1 rounded">sin(θ) ≈ x_n / D</code>, so the diameter 
                can be found by <code className="text-primary font-mono bg-primary/10 px-1 rounded">d = nλD / x_n</code>.
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
                  <Label>Wire Diameter (d)</Label>
                  <span className="text-sm font-mono text-primary">{d.toFixed(3)} mm</span>
                </div>
                <Slider 
                  value={[d]} 
                  onValueChange={(v) => setD(v[0])} 
                  min={0.05} max={0.5} step={0.01} 
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Screen Distance (D)</Label>
                  <span className="text-sm font-mono text-primary">{D.toFixed(2)} m</span>
                </div>
                <Slider 
                  value={[D]} 
                  onValueChange={(v) => setDDist(v[0])} 
                  min={0.5} max={3.0} step={0.1} 
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
                  <span className="text-muted-foreground">1st Minimum (n=1)</span>
                  <span className="font-mono">{((1 * lambda * 1e-9 * D) / (d * 1e-3) * 100).toFixed(2)} cm</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">2nd Minimum (n=2)</span>
                  <span className="font-mono">{((2 * lambda * 1e-9 * D) / (d * 1e-3) * 100).toFixed(2)} cm</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground font-medium">Formula</span>
                  <span className="font-mono text-primary bg-primary/10 px-2 rounded">x_n = nλD / d</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
