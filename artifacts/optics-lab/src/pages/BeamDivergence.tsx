import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { wavelengthToRGB } from "@/lib/optics";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default function BeamDivergence() {
  const [lambda, setLambda] = useState(633); // nm
  const [w0, setW0] = useState(0.5); // mm (beam waist)
  const [L1, setL1] = useState(2.0); // m
  const [L2, setL2] = useState(5.0); // m

  useEffect(() => {
    if (L2 <= L1) setL2(L1 + 0.5);
  }, [L1, L2]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const lambda_m = lambda * 1e-9;
  const w0_m = w0 * 1e-3;
  
  // Rayleigh range zR = pi * w0^2 / lambda
  const zR = (Math.PI * w0_m * w0_m) / lambda_m;
  
  // Beam waist at z: w(z) = w0 * sqrt(1 + (z/zR)^2)
  const getW = (z: number) => w0_m * Math.sqrt(1 + Math.pow(z / zR, 2));
  
  const w1 = getW(L1);
  const w2 = getW(L2);
  
  // Divergence angle (half-angle): theta = lambda / (pi * w0)
  const theta = lambda_m / (Math.PI * w0_m);
  const fullThetaMrad = (2 * theta) * 1000;
  
  // Experimental full divergence angle
  const expThetaRad = (2 * w2 - 2 * w1) / (L2 - L1);
  const expThetaMrad = expThetaRad * 1000;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    const color = wavelengthToRGB(lambda);
    
    const maxZ = 10; // max length 10m
    
    // Draw beam shape
    ctx.beginPath();
    for (let i = 0; i <= width; i++) {
      const z = (i / width) * maxZ;
      const w_z = getW(z);
      // scale w_z for visual purposes (it's in meters, canvas is small)
      // let's exaggerate by factor of 5000 so 1mm -> 5px
      const y = height / 2 - (w_z * 3000);
      ctx.lineTo(i, y);
    }
    for (let i = width; i >= 0; i--) {
      const z = (i / width) * maxZ;
      const w_z = getW(z);
      const y = height / 2 + (w_z * 3000);
      ctx.lineTo(i, y);
    }
    ctx.closePath();
    
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const [_, r, g, b] = match;
      const gradient = ctx.createLinearGradient(0, height/2, 0, height/2 + 20);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
      ctx.fill();
    }

    // Draw screens
    const x1 = (L1 / maxZ) * width;
    const x2 = (L2 / maxZ) * width;
    
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(x1, 0); ctx.lineTo(x1, height);
    ctx.moveTo(x2, 0); ctx.lineTo(x2, height);
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "12px monospace";
    ctx.fillText(`L1 = ${L1.toFixed(1)}m`, x1 + 5, 20);
    ctx.fillText(`L2 = ${L2.toFixed(1)}m`, x2 + 5, 20);

  }, [lambda, w0, L1, L2]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Beam Divergence</h1>
        <p className="text-muted-foreground">Measure the widening of a Gaussian laser beam</p>
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
                A perfect laser beam does not remain perfectly collimated. Due to diffraction, a Gaussian beam expands as it propagates.
              </p>
              <p>
                The beam radius <code>w(z)</code> evolves according to <code className="text-primary font-mono bg-primary/10 px-1 rounded">w(z) = w0·sqrt(1 + (z/zR)²)</code>, 
                where <code>zR</code> is the Rayleigh range. 
                The full divergence angle is <code className="text-primary font-mono bg-primary/10 px-1 rounded">θ = 2λ/(π·w0)</code>.
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
                  <Label>Initial Beam Waist (w0)</Label>
                  <span className="text-sm font-mono text-primary">{w0.toFixed(2)} mm</span>
                </div>
                <Slider 
                  value={[w0]} 
                  onValueChange={(v) => setW0(v[0])} 
                  min={0.1} max={2.0} step={0.05} 
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Distance L1</Label>
                  <span className="text-sm font-mono text-primary">{L1.toFixed(1)} m</span>
                </div>
                <Slider 
                  value={[L1]} 
                  onValueChange={(v) => setL1(v[0])} 
                  min={0.5} max={9.5} step={0.5} 
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Distance L2</Label>
                  <span className="text-sm font-mono text-primary">{L2.toFixed(1)} m</span>
                </div>
                <Slider 
                  value={[L2]} 
                  onValueChange={(v) => setL2(v[0])} 
                  min={L1 + 0.5} max={10.0} step={0.5} 
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
                  <span className="text-muted-foreground">Beam Dia. (2w) at L1</span>
                  <span className="font-mono">{(2 * w1 * 1000).toFixed(3)} mm</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Beam Dia. (2w) at L2</span>
                  <span className="font-mono">{(2 * w2 * 1000).toFixed(3)} mm</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Measured Divergence</span>
                  <span className="font-mono">{expThetaMrad.toFixed(2)} mrad</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Theoretical Divergence</span>
                  <span className="font-mono">{fullThetaMrad.toFixed(2)} mrad</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground font-medium">Formula</span>
                  <span className="font-mono text-primary bg-primary/10 px-2 rounded">θ = 2λ / (π w0)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
