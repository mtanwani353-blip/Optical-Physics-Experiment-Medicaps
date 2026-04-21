import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { wavelengthToRGB } from "@/lib/optics";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default function Grating() {
  const [lambda, setLambda] = useState(532); // nm
  const [N, setN] = useState(300); // lines/mm
  const [n, setOrder] = useState(2); // max order to compute
  const D = 1.0; // screen distance fixed at 1m

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
    const d = 1 / N; // mm
    const d_m = d * 1e-3;
    const lambda_m = lambda * 1e-9;
    
    // Screen width of 1m
    const screenWidth_m = 1.0;

    // Draw center dot
    drawSpot(ctx, width / 2, height / 2, color, 1.0);

    for (let i = 1; i <= 3; i++) {
      const sinTheta = (i * lambda_m) / d_m;
      if (Math.abs(sinTheta) <= 1) {
        const theta = Math.asin(sinTheta);
        const x_m = D * Math.tan(theta);
        
        // Map to canvas
        const pixelOffset = (x_m / screenWidth_m) * width;
        
        // Only draw if it fits on screen
        if (width / 2 + pixelOffset < width) {
          drawSpot(ctx, width / 2 + pixelOffset, height / 2, color, 1.0 - i * 0.15);
          drawSpot(ctx, width / 2 - pixelOffset, height / 2, color, 1.0 - i * 0.15);
        }
      }
    }
    
    // draw scale
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("0 cm", width / 2, height - 5);
    ctx.fillText("-50 cm", 30, height - 5);
    ctx.fillText("+50 cm", width - 30, height - 5);

  }, [lambda, N, n]);

  const drawSpot = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, intensity: number) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 10);
    
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return;
    const [_, r, g, b] = match;
    
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${intensity})`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${intensity * 0.5})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 10, y - 10, 20, 20);
  };

  const computeOrder = (order: number) => {
    const d = 1 / N;
    const sinTheta = (order * lambda * 1e-9) / (d * 1e-3);
    if (Math.abs(sinTheta) > 1) return null;
    
    const theta = Math.asin(sinTheta);
    const thetaDeg = theta * (180 / Math.PI);
    const x = D * Math.tan(theta);
    
    return { thetaDeg, x };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Diffraction Grating</h1>
        <p className="text-muted-foreground">Determine wavelength using multiple diffraction orders</p>
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
            </div>
          </Card>
          
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ChevronDown className="h-4 w-4" /> Theory
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 text-sm text-muted-foreground space-y-2">
              <p>
                A diffraction grating contains thousands of parallel slits. When light passes through, 
                constructive interference creates bright spots at specific angles.
              </p>
              <p>
                The grating equation is <code className="text-primary font-mono bg-primary/10 px-1 rounded">d sin(θ) = nλ</code>, 
                where <code>d</code> is the spacing between slits, <code>θ</code> is the diffraction angle, 
                <code>n</code> is the order number, and <code>λ</code> is the wavelength.
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
                  <Label>Lines per mm (N)</Label>
                  <span className="text-sm font-mono text-primary">{N}</span>
                </div>
                <Slider 
                  value={[N]} 
                  onValueChange={(v) => setN(v[0])} 
                  min={100} max={600} step={10} 
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Display Order Limit (n)</Label>
                  <span className="text-sm font-mono text-primary">{n}</span>
                </div>
                <Slider 
                  value={[n]} 
                  onValueChange={(v) => setOrder(v[0])} 
                  min={1} max={3} step={1} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Results (D = 1m)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {[1, 2, 3].slice(0, n).map(order => {
                  const res = computeOrder(order);
                  return (
                    <div key={order} className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Order n={order}</span>
                      {res ? (
                        <span className="font-mono">
                          θ={res.thetaDeg.toFixed(2)}°, x={(res.x * 100).toFixed(1)} cm
                        </span>
                      ) : (
                        <span className="font-mono text-destructive">Not visible</span>
                      )}
                    </div>
                  );
                })}
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground font-medium">Formula</span>
                  <span className="font-mono text-primary bg-primary/10 px-2 rounded">x_n = D·tan(arcsin(nλ/d))</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
